// src/App.js

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';

// --- IMPORTANT ---
// 1. Paste your contract's deployed address here
const STAKING_CONTRACT_ADDRESS = 'YOUR_STAKING_CONTRACT_ADDRESS';

// 2. Paste your contract's ABI here. You can get this from your compiled contract in Remix or Hardhat.
const STAKING_ABI = [
  // This is a partial ABI based on your contract. You should generate and use the full one.
  "constructor(address _token)",
  "event stakeToken(address stakeAddress, uint256 stakingAmount, uint256 stakingPeriod)",
  "event withdraw(address withdrawalAddress, uint256 withdrawAmount)",
  "function availableAmountForClaim(address _userAddress) view returns (uint256)",
  "function depositInfo(uint256) view returns (uint256 depositId, address userAddress, uint256 depositAmount, uint256 monthlyPercentage, uint256 depositedTimestamp, uint256 maturityTimestamp, uint256 timePeriodInDays)",
  "function owner() view returns (address)",
  "function releasePercentageFromDays(uint256) view returns (uint256)",
  "function setReleasePercentageV4(uint256 _days, uint256 releasePercentagePerMonth)",
  "function stakeTokens(uint256 tokenAmount, uint256 _days)",
  "function token() view returns (address)",
  "function totalTokensStaked() view returns (uint256)",
  "function userDepositIds(address, uint256) view returns (uint256)",
  "function userTotalTokenStaked(address) view returns (uint256)",
  "function withdrawTokensV4()",
];

// 3. This is a standard ERC20 ABI. It should work for most tokens.
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// Define your staking options here. The `days` value must match what you set in the contract with setReleasePercentageV4.
const STAKING_OPTIONS = [
  { days: 30, label: "30 Days" },
  { days: 90, label: "90 Days" },
  { days: 180, label: "180 Days" },
];


function App() {
  // Connection and contract state
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenDecimals, setTokenDecimals] = useState(18);

  // UI/Data state
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Global Stats
  const [totalStaked, setTotalStaked] = useState('0');

  // User Stats
  const [userTokenBalance, setUserTokenBalance] = useState('0');
  const [userTotalStaked, setUserTotalStaked] = useState('0');
  const [claimableAmount, setClaimableAmount] = useState('0');
  const [userDeposits, setUserDeposits] = useState([]);

  // Form state
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDays, setStakeDays] = useState(STAKING_OPTIONS[0].days);
  const [stakingOptionsWithAPY, setStakingOptionsWithAPY] = useState([]);

  // Transaction loading states
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Admin form state
  const [adminDays, setAdminDays] = useState('');
  const [adminPercentage, setAdminPercentage] = useState('');
  const [isSettingPercentage, setIsSettingPercentage] = useState(false);


  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert("Please install MetaMask!");
        return;
      }
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = web3Provider.getSigner();
      const userAddress = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(userAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const formatBalance = (value) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatUnits(value, tokenDecimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const fetchData = useCallback(async () => {
    if (!stakingContract || !tokenContract || !account) return;
    
    setIsLoading(true);
    try {
      // Global stats
      const totalStakedPromise = stakingContract.totalTokensStaked();
      
      // User stats
      const userTokenBalancePromise = tokenContract.balanceOf(account);
      const userTotalStakedPromise = stakingContract.userTotalTokenStaked(account);
      const claimableAmountPromise = stakingContract.availableAmountForClaim(account);
      
      // Fetch user deposit IDs. This is tricky as Solidity doesn't return dynamic arrays directly.
      // We need to fetch one by one, or have a function that returns the count.
      // Based on your contract, we assume `userDepositIds` can be fetched.
      // NOTE: Your contract has a potential issue with fetching all deposit IDs. A better pattern is to have a function `getUserDepositIds(address) returns (uint256[])`.
      // For now, we'll try to fetch them assuming a getter structure.
      const deposits = [];
      let i = 0;
      while (true) {
        try {
          const depositId = await stakingContract.userDepositIds(account, i);
          const deposit = await stakingContract.depositInfo(depositId);
          deposits.push(deposit);
          i++;
        } catch (error) {
          // Break the loop when the array index is out of bounds
          break;
        }
      }
      
      const [total, balance, userStaked, claimable] = await Promise.all([
        totalStakedPromise,
        userTokenBalancePromise,
        userTotalStakedPromise,
        claimableAmountPromise
      ]);

      setTotalStaked(formatBalance(total));
      setUserTokenBalance(formatBalance(balance));
      setUserTotalStaked(formatBalance(userStaked));
      setClaimableAmount(formatBalance(claimable));
      setUserDeposits(deposits);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, tokenContract, account, tokenDecimals]);

  useEffect(() => {
    if (account && signer) {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      setStakingContract(contract);

      const setupTokenContract = async () => {
        try {
          const tokenAddress = await contract.token();
          const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
          const decimals = await token.decimals();
          setTokenContract(token);
          setTokenDecimals(decimals);
        } catch(e) {
            console.error("Failed to setup token contract:", e);
        }
      };
      
      const checkOwner = async () => {
        const ownerAddress = await contract.owner();
        setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
      }

      setupTokenContract();
      checkOwner();
    }
  }, [account, signer]);

  useEffect(() => {
    if (stakingContract && tokenContract && account) {
      fetchData();
    }
  }, [stakingContract, tokenContract, account, fetchData]);

  useEffect(() => {
      const fetchStakingOptions = async () => {
          if(!stakingContract) return;
          const optionsWithApy = await Promise.all(STAKING_OPTIONS.map(async (option) => {
              const monthlyPercentage = await stakingContract.releasePercentageFromDays(option.days);
              // NOTE: Your contract divides by 1000. So 50 means 5%.
              const displayPercentage = monthlyPercentage.toNumber() / 10;
              return {...option, percentage: displayPercentage};
          }));
          setStakingOptionsWithAPY(optionsWithApy);
      };
      if (stakingContract) {
        fetchStakingOptions();
      }
  }, [stakingContract]);


  const handleApprove = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsApproving(true);
    try {
      const amountInWei = ethers.utils.parseUnits(stakeAmount, tokenDecimals);
      const tx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei);
      await tx.wait();
      alert("Approval successful! You can now stake your tokens.");
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed. Check the console for details.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsStaking(true);
    try {
      const amountInWei = ethers.utils.parseUnits(stakeAmount, tokenDecimals);
      
      const allowance = await tokenContract.allowance(account, STAKING_CONTRACT_ADDRESS);
      if (allowance.lt(amountInWei)) {
        alert("You must approve the token transfer first.");
        setIsStaking(false);
        return;
      }

      const tx = await stakingContract.stakeTokens(amountInWei, stakeDays);
      await tx.wait();
      alert("Staking successful!");
      setStakeAmount('');
      fetchData();
    } catch (error) {
      console.error("Staking failed:", error);
      alert("Staking failed. Check the console for details.");
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const tx = await stakingContract.withdrawTokensV4();
      await tx.wait();
      alert("Rewards claimed successfully!");
      fetchData();
    } catch (error) {
      console.error("Claiming failed:", error);
      alert("Claiming failed. Check the console for details.");
    } finally {
      setIsClaiming(false);
    }
  };
  
  const handleSetPercentage = async (e) => {
      e.preventDefault();
      if(!adminDays || !adminPercentage) {
          alert("Please fill in both fields.");
          return;
      }
      setIsSettingPercentage(true);
      try {
          // Example: User enters 5 for 5%. We store 50 because contract divides by 1000.
          const percentageToStore = parseFloat(adminPercentage) * 10;
          const tx = await stakingContract.setReleasePercentageV4(adminDays, percentageToStore);
          await tx.wait();
          alert("Release percentage set successfully!");
          setAdminDays('');
          setAdminPercentage('');
      } catch (error) {
          console.error("Failed to set percentage:", error);
          alert("Failed to set percentage. Check console.");
      } finally {
          setIsSettingPercentage(false);
      }
  };
  
  const renderProgressBar = (deposit) => {
    const startTime = deposit.depositedTimestamp.toNumber();
    const endTime = deposit.maturityTimestamp.toNumber();
    const now = Math.floor(Date.now() / 1000);
    
    if (now >= endTime) {
        return <span className="status-completed">Completed</span>;
    }

    const progress = ((now - startTime) / (endTime - startTime)) * 100;
    
    return (
        <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
    );
  };

  return (
    <div className="App">
      <header className="header">
        <div className="logo">LTC Staking</div>
        <button onClick={connectWallet} className="btn btn-primary" disabled={!!account}>
          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
        </button>
      </header>

      {/* --- Staking Hub --- */}
      <div className="card staking-hub">
        <h2>Total Tokens Staked</h2>
        <div className="stat-value">{totalStaked}</div>
        <hr style={{borderColor: 'var(--border-color)', margin: '2rem 0'}} />
        
        <div className="form-group">
          <label>
            <span>Amount to Stake</span>
            <span>Balance: {userTokenBalance}</span>
          </label>
          <div className="input-group">
            <input 
                type="number" 
                className="input-field" 
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
            />
            <button className="btn" onClick={() => setStakeAmount(ethers.utils.formatUnits(userTokenBalance, tokenDecimals))}>MAX</button>
          </div>
        </div>

        <div className="form-group">
          <label>Staking Period</label>
          <select className="input-field" value={stakeDays} onChange={(e) => setStakeDays(Number(e.target.value))}>
            {stakingOptionsWithAPY.map(option => (
                <option key={option.days} value={option.days}>
                    {option.label} (Est. {option.percentage}% Monthly)
                </option>
            ))}
          </select>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={handleApprove} disabled={!account || isApproving || isStaking}>
            {isApproving ? 'Approving...' : '1. Approve'}
          </button>
          <button className="btn btn-primary" onClick={handleStake} disabled={!account || isStaking || isApproving}>
            {isStaking ? 'Staking...' : '2. Stake'}
          </button>
        </div>
      </div>
      
      {/* --- User Dashboard --- */}
      {account && (
        isLoading ? <div className="loader"></div> :
        <>
            <div className="dashboard-summary">
                <div className="summary-card">
                    <h3>Your Total Staked</h3>
                    <div className="value">{userTotalStaked}</div>
                </div>
                <div className="summary-card">
                    <h3>Available to Claim</h3>
                    <div className="value">{claimableAmount}</div>
                    <button className="btn btn-primary" onClick={handleClaim} disabled={isClaiming || parseFloat(claimableAmount) === 0}>
                        {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                    </button>
                </div>
            </div>

            <div className="deposits-section">
                <h2>My Deposits</h2>
                <div className="card">
                    <table className="deposits-table">
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Period</th>
                                <th>Maturity Date</th>
                                <th>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userDeposits.length > 0 ? userDeposits.map((deposit, index) => (
                                <tr key={index}>
                                    <td>{formatBalance(deposit.depositAmount)}</td>
                                    <td>{deposit.timePeriodInDays.toString()} Days</td>
                                    <td>{new Date(deposit.maturityTimestamp.toNumber() * 1000).toLocaleString()}</td>
                                    <td>{renderProgressBar(deposit)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4">You have no active deposits.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}

      {/* --- Admin Panel --- */}
      {isOwner && (
        <div className="card admin-panel">
          <h2>Admin Panel</h2>
          <form onSubmit={handleSetPercentage}>
            <div className="form-group">
              <label>Set Release Percentage</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="Days (e.g., 90)"
                value={adminDays}
                onChange={(e) => setAdminDays(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="number" 
                step="0.1"
                className="input-field" 
                placeholder="Monthly Percentage (e.g., 5 for 5%)"
                value={adminPercentage}
                onChange={(e) => setAdminPercentage(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSettingPercentage}>
              {isSettingPercentage ? 'Setting...' : 'Set Percentage'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default App;