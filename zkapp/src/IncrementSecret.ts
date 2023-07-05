import { Field, SmartContract, state, State, method, Poseidon } from 'snarkyjs';

export class IncrementSecret extends SmartContract {
  @state(Field) x = State<Field>();

  @method initState(salt: Field, firstSecret: Field) {
  }

  @method incrementSecret(salt: Field, secret: Field) {
  }
}