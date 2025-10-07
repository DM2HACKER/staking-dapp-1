// src/App.js

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';

const STAKING_CONTRACT_ADDRESS = 0x9e38B8B5428A550A0016fB31d1194E64f8171dE0;
const STAKING_ABI = [[
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "_token",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_days",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "releasePercentagePerMonth",
				"type": "uint256"
			}
		],
		"name": "setReleasePercentageV4",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "stakeAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "stakingAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "stakingPeriod",
				"type": "uint256"
			}
		],
		"name": "stakeToken",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_days",
				"type": "uint256"
			}
		],
		"name": "stakeTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "withdrawalAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "withdrawAmount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdrawTokensV4",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "availableAmountForClaim",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "depositCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "depositInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "depositId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "depositAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "monthlyPercentage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "depositedTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maturityTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timePeriodInDays",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "releasePercentageFromDays",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalTokensStaked",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userDepositCounts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userDepositIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userStakedStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userTotalTokenStaked",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "withdrawnAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]];
const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)", "function allowance(address,address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)",
  "function owner() view returns (address)", "function mint(address to, uint256 amount)"
];

const DURATION_OPTIONS = [{ days: 30, risk: "Low risk" }, { days: 90, risk: "Medium risk" }, { days: 365, risk: "High risk" }];

function App() {
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenOwner, setIsTokenOwner] = useState(false);

  const [userTokenBalance, setUserTokenBalance] = useState('0');
  const [userTotalStaked, setUserTotalStaked] = useState('0');
  const [claimableAmount, setClaimableAmount] = useState('0');
  const [userDeposits, setUserDeposits] = useState([]);
  const [stakingPlans, setStakingPlans] = useState([]);

  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDays, setStakeDays] = useState(90);
  const [estimatedReward, setEstimatedReward] = useState('0.00');
  const [maturityDate, setMaturityDate] = useState('');

  const [mintAmount, setMintAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const connectWallet = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const web3Signer = provider.getSigner();
      setSigner(web3Signer);
      setAccount(await web3Signer.getAddress());
    } catch (error) { console.error("Error connecting wallet:", error); }
  };

  const formatBalance = (value, decimals = tokenDecimals) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatUnits(value, decimals)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const fetchData = useCallback(async () => {
    if (!stakingContract || !tokenContract || !account) return;
    setIsLoading(true);
    try {
      const [balance, userStaked, claimable] = await Promise.all([tokenContract.balanceOf(account), stakingContract.userTotalTokenStaked(account), stakingContract.availableAmountForClaim(account)]);
      const deposits = [];
      for (let i = 0; ; i++) {
        try {
          const depositId = await stakingContract.userDepositIds(account, i);
          if (depositId.isZero()) break;
          const deposit = await stakingContract.depositInfo(depositId);
          deposits.push(deposit);
        } catch (error) { break; }
      }
      setUserTokenBalance(formatBalance(balance));
      setUserTotalStaked(formatBalance(userStaked));
      setClaimableAmount(formatBalance(claimable));
      setUserDeposits(deposits);
    } catch (error) { console.error("Error fetching data:", error); } 
    finally { setIsLoading(false); }
  }, [stakingContract, tokenContract, account, tokenDecimals]);

  useEffect(() => {
    if (account && signer) {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      setStakingContract(contract);
      const setupToken = async () => {
        try {
          const tokenAddr = await contract.token();
          const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
          setTokenContract(token);
          setTokenDecimals(await token.decimals());
          const tokenOwnerAddress = await token.owner();
          setIsTokenOwner(tokenOwnerAddress.toLowerCase() === account.toLowerCase());
        } catch (e) { console.error("Failed to setup token contract or check owner:", e); }
      };
      setupToken();
    }
  }, [account, signer]);

  useEffect(() => { if (stakingContract && tokenContract && account) fetchData(); }, [stakingContract, tokenContract, account, fetchData]);

  useEffect(() => {
    const fetchStakingPlans = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
        const readOnlyContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);
        const plans = await Promise.all(DURATION_OPTIONS.map(async (option) => {
          const monthlyPercentageRaw = await readOnlyContract.releasePercentageFromDays(option.days);
          const monthlyPercentage = monthlyPercentageRaw.toNumber() / 10;
          const apy = monthlyPercentage * 12;
          return { ...option, percentage: monthlyPercentage, apy: apy };
        }));
        setStakingPlans(plans);
      } catch (error) { console.error("Could not fetch staking plans:", error); }
    };
    fetchStakingPlans();
  }, []);

  useEffect(() => {
    const currentPlan = stakingPlans.find(p => p.days === stakeDays);
    if (stakeAmount > 0 && currentPlan) {
      const monthlyRate = currentPlan.percentage / 100;
      setEstimatedReward((parseFloat(stakeAmount) * monthlyRate).toFixed(4));
    } else { setEstimatedReward('0.00'); }
    const date = new Date();
    date.setDate(date.getDate() + stakeDays);
    setMaturityDate(date.toLocaleDateString());
  }, [stakeAmount, stakeDays, stakingPlans]);

  const handleApprove = async () => { if (!stakeAmount || parseFloat(stakeAmount) <= 0) return; setIsApproving(true); try { await (await tokenContract.approve(STAKING_CONTRACT_ADDRESS, ethers.utils.parseUnits(stakeAmount, tokenDecimals))).wait(); alert("Approval successful!"); } catch (error) { alert("Approval failed."); console.error(error); } finally { setIsApproving(false); } };
  const handleStake = async () => { if (!stakeAmount || parseFloat(stakeAmount) <= 0) return; setIsStaking(true); try { await (await stakingContract.stakeTokens(ethers.utils.parseUnits(stakeAmount, tokenDecimals), stakeDays)).wait(); alert("Staking successful!"); setStakeAmount(''); fetchData(); } catch (error) { alert("Staking failed."); console.error(error); } finally { setIsStaking(false); } };
  const handleClaim = async () => { setIsClaiming(true); try { await (await stakingContract.withdrawTokensV4()).wait(); alert("Rewards claimed!"); fetchData(); } catch (error) { alert("Claiming failed."); console.error(error); } finally { setIsClaiming(false); } };
  const handleMint = async () => { if (!mintAmount || parseFloat(mintAmount) <= 0) return alert("Please enter a valid amount to mint."); setIsMinting(true); try { await (await tokenContract.mint(account, ethers.utils.parseUnits(mintAmount, tokenDecimals))).wait(); alert("Tokens minted successfully!"); setMintAmount(''); fetchData(); } catch (error) { alert("Minting failed. Check console for details."); console.error("Minting error:", error); } finally { setIsMinting(false); } };

  return (
    <div className="App">
      <header className="header"><div className="header-left"><div className="logo">Litcoin Staking</div></div><button onClick={connectWallet} className="btn btn-primary" disabled={!!account}>{account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}</button></header>
      <div className="dashboard-metrics"><div className="metric-card"><div className="metric-card-header"><span>Total Staked</span><div className="metric-icon" style={{ background: 'var(--gradient-blue)' }}></div></div><div className="metric-card-value">{userTotalStaked}</div><div className="metric-card-footer">LTC Tokens</div></div><div className="metric-card"><div className="metric-card-header"><span>Available Rewards</span><div className="metric-icon" style={{ background: 'var(--gradient-green)' }}></div></div><div className="metric-card-value">{claimableAmount}</div><div className="metric-card-footer">LTC Tokens</div></div><div className="metric-card"><div className="metric-card-header"><span>Active Stakes</span><div className="metric-icon" style={{ background: 'var(--gradient-blue)' }}></div></div><div className="metric-card-value">{userDeposits.length}</div><div className="metric-card-footer">Positions</div></div></div>
      
      <main className="main-layout">
        <div className="main-content">
          
          {isTokenOwner && (
            <div className="card balance-card">
              <div className="balance-card-header">
                <h2>Your Balance</h2>
                <div className="balance-value">{userTokenBalance} <span style={{fontSize: '1rem', color: 'var(--text-tertiary)'}}>LTC</span></div>
              </div>
              <div className="mint-section">
                <p>Owner Action: Mint additional Litcoin tokens.</p>
                <div className="mint-input-group">
                  <input type="number" className="input-field" placeholder="Amount to mint" value={mintAmount} onChange={e => setMintAmount(e.target.value)} disabled={!account}/>
                  <button className="btn btn-mint" onClick={handleMint} disabled={!account || isMinting}>{isMinting ? 'Minting...' : 'Mint'}</button>
                </div>
              </div>
            </div>
          )}

          <div className="card stake-card">
            <h2>Stake Tokens</h2>
            <div className="form-group"><label className="form-label"><span>Staking Amount</span><span>Available: {userTokenBalance}</span></label><div className="input-wrapper"><input type="number" className="input-field" placeholder="0.00" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} /><button className="max-btn" onClick={() => setStakeAmount(userTokenBalance.replace(/,/g, ''))}>MAX</button></div></div>
            <div className="form-group">
              <label className="form-label">Staking Period</label>
              <div className="staking-period-options">
                {stakingPlans.map(plan => (
                  <div key={plan.days} className={`period-option ${stakeDays === plan.days ? 'active' : ''}`} onClick={() => setStakeDays(plan.days)}>
                    <h4>{plan.days} Days</h4>
                    <span>{plan.apy}% APY</span>
                    <p>{plan.risk}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="estimation-row"><span>Estimated Monthly Rewards:</span><span>~{estimatedReward} LTC</span></div>
            <div className="estimation-row"><span>Maturity Date:</span><span>{maturityDate}</span></div>
            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
              <button onClick={handleApprove} className="btn btn-primary" style={{flex: 1, background: 'var(--border-color)'}} disabled={!account || isApproving}> {isApproving ? 'Approving...' : '1. Approve'}</button>
              <button onClick={handleStake} className="btn btn-primary" style={{flex: 2}} disabled={!account || isStaking}> {isStaking ? 'Staking...' : '2. Stake Tokens'}</button>
            </div>
            {!account && <p className="connect-prompt">Connect your wallet to start staking</p>}
          </div>

          <div className="card portfolio-card">
            <h2>Your Staking Portfolio</h2>
            {account ? ( isLoading ? <div className="loader"></div> : userDeposits.length > 0 ? (<table className="portfolio-table"><thead><tr><th>ID</th><th>Amount</th><th>Monthly Rate</th><th>Maturity Date</th><th>Status</th></tr></thead><tbody>{userDeposits.map((deposit) => { const isMatured = deposit.maturityTimestamp.toNumber() * 1000 < Date.now(); return(<tr key={deposit.depositId.toString()}><td>#{deposit.depositId.toString()}</td><td>{formatBalance(deposit.depositAmount)} LTC</td><td>{deposit.monthlyPercentage.toNumber() / 10}%</td><td>{new Date(deposit.maturityTimestamp.toNumber() * 1000).toLocaleDateString()}</td><td><span className={`status-tag ${isMatured ? 'status-matured' : 'status-active'}`}>{isMatured ? 'Matured' : 'Active'}</span></td></tr>)})}</tbody></table>) : <p className="connect-prompt">You have no active stakes.</p>) : <p className="connect-prompt">Connect your wallet to view your staking portfolio</p>}
          </div>
        </div>

        <aside className="sidebar">
          <div className="card rewards-card"><h2>Available Rewards</h2><div className="rewards-circle"><span className="rewards-amount">{claimableAmount}</span></div><button onClick={handleClaim} className="btn btn-claim" disabled={!account || isClaiming || parseFloat(claimableAmount.replace(/,/g, '')) === 0}>{isClaiming ? 'Claiming...' : 'Claim Rewards'}</button>{!account && <p className="connect-prompt">Connect your wallet to view rewards</p>}</div>
          <div className="card quick-actions-card"><h2>Quick Actions</h2><a href="#" className="quick-action-item">Transaction History</a><a href="#" className="quick-action-item">ROI Calculator</a><a href="#" className="quick-action-item">Help Center</a></div>
        </aside>
      </main>
    </div>
  );
}

export default App;