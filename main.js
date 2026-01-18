// --- 1. CONFIGURATION ---
const contractAddress = "0xef44419E8361F543247920DB7CEC5bc6bBC75dE2";
const abi = [
    {"inputs": [{"internalType": "string", "name": "_electionName", "type": "string"}, {"internalType": "string[]", "name": "_candidateNames", "type": "string[]"}], "stateMutability": "nonpayable", "type": "constructor"},
    {"inputs": [{"internalType": "uint256", "name": "_candidateIndex", "type": "uint256"}], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "voter", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "candidateId", "type": "uint256"}], "name": "VoteCasted", "type": "event"},
    {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "candidates", "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "uint256", "name": "voteCount", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "electionName", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_index", "type": "uint256"}], "name": "getCandidate", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {"internalType": "string", "name": "", "type": "string"}, {"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "getNumCandidates", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "totalVotes", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "", "type": "address"}], "name": "voters", "outputs": [{"internalType": "bool", "name": "hasVoted", "type": "bool"}, {"internalType": "uint256", "name": "voteIndex", "type": "uint256"}], "stateMutability": "view", "type": "function"}
];

let contract;
let signer;

// --- 2. MOUSE AURA MOTION ---
const aura = document.getElementById('aura');
window.onmousemove = (e) => {
    aura.style.left = e.clientX + 'px';
    aura.style.top = e.clientY + 'px';
};

// --- 3. INITIALIZATION ---
document.getElementById('connectButton').onclick = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);
            
            document.getElementById('connectButton').innerText = "LINKED";
            document.getElementById('status').innerHTML = '<span class="pulse-dot"></span> System Synchronized';
            loadElection();
        } catch (err) {
            console.error("Connection failed:", err);
        }
    } else {
        alert("MetaMask not detected!");
    }
};

async function loadElection() {
    const name = await contract.electionName();
    document.getElementById('electionName').innerText = name;

    const count = await contract.getNumCandidates();
    const grid = document.getElementById('candidateCards');
    grid.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const c = await contract.getCandidate(i);
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-tilt', ''); 
        card.innerHTML = `
            <h3 style="color: var(--primary); margin:0; opacity: 0.6;">CANDIDATE_0${i}</h3>
            <h2 style="font-size: 2rem; margin: 10px 0;">${c[1]}</h2>
            <div style="font-size: 4rem; font-weight: 800; margin: 20px 0;">${c[2].toString()}</div>
            <p style="color: #6b7280; font-size: 0.9rem;">Verified Blockchain Tally</p>
            <button class="vote-btn" onclick="castVote(${i})">BROADCAST VOTE</button>
        `;
        grid.appendChild(card);
    }

    // ACTIVATE 3D TILT
    VanillaTilt.init(document.querySelectorAll(".card"), {
        max: 15, speed: 400, glare: true, "max-glare": 0.2,
    });
}

// --- 4. GLOBAL VOTE FUNCTION ---
window.castVote = async (id) => {
    try {
        const tx = await contract.vote(id);
        document.getElementById('status').innerText = "Transmitting to Ledger...";
        await tx.wait(); // Wait for network confirmation
        document.getElementById('status').innerText = "Transaction Finalized";
        loadElection();
    } catch (e) {
        alert("Transaction Failed: Single Vote Constraint Violated.");
    }
};