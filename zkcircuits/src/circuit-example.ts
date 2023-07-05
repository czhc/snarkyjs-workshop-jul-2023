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
      },
      step: {
      },
    },
  });

  console.log("Compiling...");
  const { verificationKey } = await ZKCircuit.compile();
};

main();
