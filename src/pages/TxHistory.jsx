
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const STAKING_ADDRESS = "0xD0b045CFef458f557d28D0D39E4f68F695806034";
const STAKING_ABI_READ = [
  "function token() view returns (address)",
  "function userDepositCounts(address) view returns (uint256)",
  "function userDepositIds(address,uint256) view returns (uint256)",
  "function depositInfo(uint256) view returns (uint256 depositId, address userAddress, uint256 depositAmount, uint256 monthlyPercentage, uint256 depositedTimestamp, uint256 maturityTimestamp, uint256 timePeriodInDays)",
];
const ERC20_READ = [
  "function decimals() view returns (uint8)",
];

function formatDate(ts) {
  try { return new Date(Number(ts) * 1000).toLocaleString(); } catch { return "—"; }
}

export default function TxHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addr, setAddr] = useState("");
  const [decimals, setDecimals] = useState(18);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setAddr(account);

        const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI_READ, provider);
        // fetch token decimals to pretty-print amounts
        try {
          const tokenAddr = await staking.token();
          const token = new ethers.Contract(tokenAddr, ERC20_READ, provider);
          const dec = await token.decimals();
          setDecimals(dec);
        } catch {}

        const countBN = await staking.userDepositCounts(account);
        const count = Number(countBN.toString());
        const out = [];
        for (let i = 0; i < count; i++) {
          const id = await staking.userDepositIds(account, i);
          const d = await staking.depositInfo(id);
          const monthlyPct = Number(d.monthlyPercentage.toString()) / 10; // tenths of a percent
          out.push({
            id: d.depositId.toString(),
            amount: d.depositAmount,
            monthly: monthlyPct,
            start: d.depositedTimestamp.toString(),
            maturity: d.maturityTimestamp.toString(),
            days: d.timePeriodInDays.toString(),
          });
        }
        // newest first
        out.sort((a, b) => Number(b.id) - Number(a.id));
        setRows(out);
      } catch (e) {
        console.error("TxHistory load error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmtAmount = (wei) => {
    try { return Number(ethers.utils.formatUnits(wei, decimals)).toLocaleString(); } catch { return wei?.toString?.() ?? "0"; }
  };

  return (
    <div className="page">
      <h1>Transaction History</h1>
      <p>Wallet: {addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—"}</p>
      {loading ? (
        <div className="loader" />
      ) : rows.length ? (
        <table className="portfolio-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Monthly %</th>
              <th>Start</th>
              <th>Maturity</th>
              <th>Period (days)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const matured = Number(r.maturity) * 1000 < Date.now();
              return (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{fmtAmount(r.amount)} LTC</td>
                  <td>{r.monthly}%</td>
                  <td>{formatDate(r.start)}</td>
                  <td>{new Date(Number(r.maturity) * 1000).toLocaleDateString()}</td>
                  <td>{r.days}</td>
                  <td>
                    <span className={`status-tag ${matured ? "status-matured" : "status-active"}`}>
                      {matured ? "Matured" : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No records found.</p>
      )}
    </div>
  );
}


