import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, Signer, Pda, signerIdentity, publicKey, PublicKey, generateRandomString } from '@metaplex-foundation/umi';
import {} from '@metaplex-foundation/umi-signer-wallet-adapters';
import { FanoutMembershipMintVoucher, distributeWallet, InitForMintInstructionAccounts, MembershipModel, addMemberWallet, fetchFanout, fetchFanoutMembershipMintVoucher, fetchFanoutMint, findFanoutMembershipMintVoucherPda, findFanoutNativeAccountPda, findFanoutPda, init, mplHydra, findFanoutMembershipVoucherPda, initForMint, InitForMintInstructionDataArgs } from '@metaplex-foundation/mpl-hydra';
// import { distributeWallet } from './distributeWallet'
import { PublicKey as SolPubKey, clusterApiUrl } from '@solana/web3.js';
import base58 from "bs58";
import dotenv from "dotenv";
import { getAssociatedTokenAddress, NATIVE_MINT } from '@solana/spl-token';

dotenv.config()


export type AddMemberWalletInstructionAccounts = {
  authority?: Signer;
  member: PublicKey | Pda;
  fanout: PublicKey | Pda;
  membershipAccount?: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
};

export type AddMemberWalletInstructionDataArgs = { shares: number | bigint };

export type DistributeWalletInstructionAccounts = {
  payer?: Signer;
  member: PublicKey | Pda;
  membershipVoucher: PublicKey | Pda;
  fanout: PublicKey | Pda;
  holdingAccount: PublicKey | Pda;
  fanoutForMint: PublicKey | Pda;
  fanoutForMintMembershipVoucher: PublicKey | Pda;
  fanoutMint: PublicKey | Pda;
  fanoutMintMemberTokenAccount: PublicKey | Pda;
  systemProgram?: PublicKey | Pda;
  rent?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
};

export type DistributeWalletInstructionDataArgs = {
  distributeForMint: boolean;
};

(async() => {

  async function myFunction(
  
  ): Promise<void> {
    
    const umi = createUmi(clusterApiUrl('devnet'))
    .use(mplHydra())

    const walletBytes = base58.decode(`${process.env.PKEY}`)

    const myKeypair = umi.eddsa.createKeypairFromSecretKey(walletBytes)
    const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);

    //console.log(isSigner(myKeypairSigner))

    umi.use(signerIdentity(myKeypairSigner, true))
    const name = generateRandomString();
    // const tx = await init(umi, {
    //   name,
    //   model: MembershipModel.Wallet,
    //   totalShares: 100,
    // }).sendAndConfirm(umi)

    // let signature = base58.encode(tx.signature);

    // console.log(signature)

    // const [fanout, fanoutBump] = findFanoutPda(umi, { name });
    // const nativeAccount = await findFanoutNativeAccountPda(umi, { fanout });
    // const fanoutAccount = await fetchFanout(umi, fanout);

    // console.log("fanout " + fanout)
    // console.log("nativeAccount " + nativeAccount)
    // console.log("fanoutAccount " + fanoutAccount)

    // const holding = await fetchFanoutMint(umi, fanout)
    // console.log(holding)

    const native = publicKey(NATIVE_MINT)
    const fanout = publicKey('3dYFEp3vVQJvHRN5bThNRKFsqLj8be8jsmzphZuUCxia')
    const mint = publicKey('Ee79adtuYt4ecrJ6NFP8WF7FTcMb5hDuxRwLHsdu4VQM')
    const tokenAcc = publicKey('9MEfwn27SzkFUv1Ai7vjQH4uF5h1vTuRszdfiNgfcNh5')

    const SOL_MINT = new SolPubKey('So11111111111111111111111111111111111111112');
    
    const ownerPublicKey = new SolPubKey('3dYFEp3vVQJvHRN5bThNRKFsqLj8be8jsmzphZuUCxia')

    const wrappedSOLAccount = await getAssociatedTokenAddress(
      SOL_MINT,
      ownerPublicKey
    );

    const memTokenAccount = publicKey(wrappedSOLAccount.toBase58());

    console.log(memTokenAccount)

    const args: InitForMintInstructionAccounts = {
     authority: myKeypairSigner,
     fanout: fanout,
     fanoutForMint: native,
     mintHoldingAccount: tokenAcc,
     mint: mint,
    } 

    const dataArgs: InitForMintInstructionDataArgs = {
      bumpSeed: 0
    }
    const fanoutMint = initForMint(umi, {...args, ...dataArgs}).sendAndConfirm(umi)

    console.log("fM " + (await fanoutMint).signature)

    const member1 = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');

   // const membershipAccount = umi.eddsa.generateKeypair()

    const inputAccounts: AddMemberWalletInstructionAccounts = {
     authority: myKeypairSigner,
     member: member1,
     fanout: fanout
    }

    const inputIx: AddMemberWalletInstructionDataArgs = {
      shares: 1
    }

    const addMemberTx = addMemberWallet(umi, {...inputAccounts, ...inputIx}).sendAndConfirm(umi)

    // signature = base58.encode((await addMemberTx).signature);

    // //console.log("membershipAccount" + membershipAccount.publicKey)
    // console.log(signature)

  }

  async function distribute() {
    const umi = createUmi(clusterApiUrl('devnet'))
    .use(mplHydra())

    const walletBytes = base58.decode(`${process.env.PKEY}`)

    const myKeypair = umi.eddsa.createKeypairFromSecretKey(walletBytes)
    const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);

    umi.use(signerIdentity(myKeypairSigner, true))

    const member1 = publicKey('3dDJXB4wQbYxnwzQwnhe8f1xy1NJL3Cc2y3fY544EbbT');

    const SOL_MINT = new SolPubKey('So11111111111111111111111111111111111111112');
    
    const solMint = publicKey('So11111111111111111111111111111111111111112')
    const ownerPublicKey = new SolPubKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ')

    const wrappedSOLAccount = await getAssociatedTokenAddress(
      SOL_MINT,
      ownerPublicKey
    );

    const memTokenAccount = publicKey(wrappedSOLAccount.toBase58());

    const membership = publicKey('7XQaZJT8dh4dspNRSMkJsySXvMiMvCqBdoVShAUNUruH');
    
    const memberVoucher : FanoutMembershipMintVoucher = await fetchFanoutMembershipMintVoucher(
      umi,
      membership
    )
    const fanout = publicKey('9E2qMAVT1oxbVjAgVxhh7GujNAfRupp7jSsFjexRmeQ8');
    

    const holding = publicKey('EJFvXHmpktMnUU7qGwbJbtkNuw4yx3eo6WRuXaDfCU8b');

    
    // const fanoutMintMemberTokenAccount = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');

    const hydra = publicKey('hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg')
    const mint = publicKey('hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg')
    
    const fanoutMint = await fetchFanoutMint(umi, fanout)

    const seeds = {
      fanout: fanout,
      member: membership,
    }


    const fanoutForMintMembershipVoucher = findFanoutMembershipVoucherPda(umi, seeds)

    console.log(membership)
    const dixAcc: DistributeWalletInstructionAccounts = {
     payer: myKeypairSigner,
     member: member1,
     membershipVoucher: fanoutForMintMembershipVoucher,
     fanout: fanoutMint.publicKey,
     holdingAccount: holding,
     fanoutMint: solMint,
     fanoutForMint: hydra,
     fanoutForMintMembershipVoucher: hydra,
     fanoutMintMemberTokenAccount: hydra
    }

 

    const dixIx: DistributeWalletInstructionDataArgs = {
      distributeForMint: false
    }

    const distribute = distributeWallet(umi, {...dixAcc, ...dixIx }).sendAndConfirm(umi)

    console.log((await distribute).signature)
  }

  //distribute()
 myFunction()
})();

