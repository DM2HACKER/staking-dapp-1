import React from "react";


export default function HelpCenter() {
return (
<div className="page">
<h1>Help Center</h1>


<h3>Getting Started</h3>
<ol>
<li>Install MetaMask (or another compatible wallet).</li>
<li>Connect to the <b>Polygon Amoy</b> network.</li>
<li>Ensure you have some test MATIC for gas fees.</li>
</ol>


<h3>Using the Staking DApp</h3>
<ul>
<li>Click <b>Connect Wallet</b> and ensure you’re on Polygon Amoy.</li>
<li>Enter the amount to stake and select the desired duration.</li>
<li>Click <b>Stake Tokens</b> to approve and stake in a single step.</li>
</ul>


<h3>Troubleshooting</h3>
<ul>
<li>
<b>“Transaction failed”:</b> Check that you have enough MATIC for gas and sufficient token balance.
</li>
<li>
<b>“Balances not visible”:</b> Refresh the page after wallet connection or network change.
</li>
<li>
<b>“Wrong network”:</b> Switch to Polygon Amoy manually in MetaMask if not auto-switched.
</li>
</ul>


<h3>Admin Actions</h3>
<p>
The <b>Admin</b> page is restricted to the token owner. It allows minting and updating staking plan parameters.
</p>


<h3>Notes</h3>
<p>
This DApp runs on testnet. Do not send mainnet tokens. For issues, verify your wallet and refresh your connection.
</p>
</div>
);
}