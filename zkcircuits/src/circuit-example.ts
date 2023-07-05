import {
  Field,
  SelfProof,
  Experimental,
  Struct,
  Poseidon,
  verify,
} from 'snarkyjs';

class CircuitState extends Struct({
  stepValue: Field,
  commitment: Field,
}) {}

const main = async () => {
  console.log("Initializing...")
  const ZKCircuit = Experimental.ZkProgram({
    publicInput: CircuitState,
    publicOutput: Field, // currentStep

    methods: {
      init: {
        privateInputs: [Field],
        method(state: CircuitState, secret: Field) {
          state.stepValue = Field(1);
          state.commitment = Poseidon.hash([secret])
          return state.stepValue;
        }
      },
      step: {
        privateInputs: [Field, SelfProof],

        method(
          state: CircuitState,
          secret: Field,
          previousProof: SelfProof<CircuitState, Field>
        ){
          // allow increment only if correct secret is provided
          previousProof.publicInput.commitment.assertEquals(
            Poseidon.hash([secret])
          );
          // check proof is valid first
          previousProof.verify();
          // increment state from previousProof and stepValue
          return previousProof.publicInput.stepValue.add(state.stepValue);


        }
      },
    },
  });


  // stepValue is just an attribute for a simple addition computation


  console.log("Compiling...");
  const { verificationKey } = await ZKCircuit.compile();

  const firstProof = await ZKCircuit.init({
      commitment: Poseidon.hash([Field(10021210)]),
      stepValue: Field(1)
    },
    Field(10021210)
  );      // Field(10021210) is just some encoded string (or password)
  console.log("First proof increment: ", firstProof.publicOutput.toString());
  console.log("Verify first proof: ", await verify(firstProof, verificationKey));

  const secondProof = await ZKCircuit.step({
      commitment: Poseidon.hash([Field(10021210)]),
      stepValue: Field(5)
    },
    Field(10021210),
    firstProof
  );

  console.log("Second proof increment: ", secondProof.publicOutput.toString());
  console.log("Verify second proof: ", await verify(secondProof, verificationKey));

  // Should fail
  const thirdProof = await ZKCircuit.step({
      commitment: Poseidon.hash([Field(10021210)]),
      stepValue: Field(10)
    },
    Field(10021211),
    secondProof
  ); // this should fail because the secret is changed
  console.log("third proof: ", thirdProof.proof);
  console.log("Verify third proof: ", await verify(thirdProof, verificationKey));

};

main();
