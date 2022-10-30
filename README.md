<h1 align="center">
  <br>
  <img src="/logo.svg?raw=true" alt="Cards logo" width="256">
  <br>
</h1>

<h4 align="center">🃏 A lightning network inspired Starknet Game</h4>

# Why GasLessLiar?
Blockchain allows decentralized interactions between users following contract rules, but blockchain interactions are expensive and slow. GasLessLiar is a proof of concept of a Game which allows honest users to avoid interacting with the chain. The idea is pretty simple: a contract allows you to prove if your opponent is malicious and will punish him. And because he would be punished if he was malicious, he will probably stay honest, and your interactions will therefore stay off-chain. To check the contract code, [Click here](https://github.com/Gaseless-liar/gaslessliar).

# P2P client
Creating a decentralized game has two interesting aspects: it ensures that the rules are enforced (you can't cheat by compromising a server since there is none), and it also promises incensurability (nobody can stop you from playing). In order for our game to preserve these two properties we needed to avoid third parties, that's why we used libP2P. It allows users to connect directly, no server can stop them. 
