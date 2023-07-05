import { Field, SmartContract, state, State, method, Poseidon } from 'snarkyjs';

export class IncrementSecret extends SmartContract {
  @state(Field) x = State<Field>();

  @method initState(password: Field, firstSecret: Field) {
    this.x.set(Poseidon.hash([password, firstSecret]));
  }

  @method incrementSecret(password: Field, secret: Field) {
    const oldX = this.x.get();
    this.x.assertEquals(oldX);

    Poseidon.hash([password,secret]).assertEquals(oldX);
    this.x.set(Poseidon.hash([password, secret.add(Field(1))]));
  }
}