import { IncrementSecret } from './IncrementSecret.js';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  Poseidon
} from 'snarkyjs';

console.log('SnarkyJS loaded');

const Local = Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

const salt = Field.random();

// ----------------------------------------------------

// create a destination we will deploy the smart contract to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

await IncrementSecret.compile();
const zkAppInstance = new IncrementSecret(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.initState(salt, Field(750));
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// get the initial state of IncrementSecret after deployment
const num0 = zkAppInstance.x.get();
console.log('state after init:', num0.toString());

// ----------------------------------------------------

const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.incrementSecret(salt, Field(750));
});
await txn1.prove();
await txn1.sign([senderKey]).send();

const num1 = zkAppInstance.x.get();
console.log('state after txn1:', num1.toString());
console.log('secret after txn1:', Field(751).toString());
console.log('compute secret + pw hash after txn1:', Poseidon.hash([salt, Field(751)]).toString());

