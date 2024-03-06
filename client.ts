import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateRandomString, signerIdentity, createSignerFromKeypair, Signer, PublicKey, Pda, publicKey, RpcGetAccountOptions } from '@metaplex-foundation/umi';
import {} from '@metaplex-foundation/umi-signer-wallet-adapters';
import { MembershipModel, fetchFanout, findFanoutNativeAccountPda, addMemberWallet, findFanoutPda, init, mplHydra, distributeWallet, fetchFanoutMembershipMintVoucher, FanoutMembershipMintVoucher, findFanoutMembershipMintVoucherPda, fetchFanoutMint } from '@metaplex-foundation/mpl-hydra';
import { clusterApiUrl } from '@solana/web3.js';
import base58 from "bs58";
import dotenv from "dotenv";

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
    const tx = await init(umi, {
      name,
      model: MembershipModel.Wallet,
      totalShares: 100,
    }).sendAndConfirm(umi)

    let signature = base58.encode(tx.signature);

    console.log(signature)

    const [fanout, fanoutForMint, fanoutMintMemberTokenAccount] = findFanoutPda(umi, { name });
    const nativeAccount = findFanoutNativeAccountPda(umi, { fanout });
    const fanoutAccount = await fetchFanout(umi, fanout);

    console.log("fanout" + fanout)
    console.log("fanoutForMint" + fanoutForMint)
    console.log("fanoutMintMemberTokenAccount" + fanoutMintMemberTokenAccount)
    console.log("nativeAccount" + nativeAccount)
    console.log("fanoutAccount" + fanoutAccount)

    const member1 = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');

    const inputAccounts: AddMemberWalletInstructionAccounts = {
     authority: myKeypairSigner,
     member: member1,
     fanout: fanout
    }

    const inputIx: AddMemberWalletInstructionDataArgs = {
      shares: 1
    }

    const addMemberTx = addMemberWallet(umi, {...inputAccounts, ...inputIx}).sendAndConfirm(umi)

    signature = base58.encode((await addMemberTx).signature);

    console.log(signature)

  }

  async function distributeNft() {
    const umi = createUmi(clusterApiUrl('devnet'))
    .use(mplHydra())

    const walletBytes = base58.decode(`${process.env.PKEY}`)

    const myKeypair = umi.eddsa.createKeypairFromSecretKey(walletBytes)
    const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);

    const member1 = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');
    const memberVoucher : FanoutMembershipMintVoucher = await fetchFanoutMembershipMintVoucher(
      umi,
      member1
    )
    const fanout = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');
    const fanoutForMint = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');

    const holding = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');
    const fanoutMintMemberTokenAccount = publicKey('9Xkt75L6YLmfVyNXQyBzM2Cd8PUW6pmUZSk3oyG57cjJ');

    const mint = publicKey('So11111111111111111111111111111111111111112')

    const seeds = {
      fanout: fanout,
      membership: member1,
      mint: mint
    }

    const fanoutMint = await fetchFanoutMint(umi, fanout)

    const fanoutForMintMembershipVoucher = findFanoutMembershipMintVoucherPda(umi, seeds)

    const dixAcc: DistributeWalletInstructionAccounts = {
     payer: myKeypairSigner,
     member: member1,
     membershipVoucher: memberVoucher.publicKey,
     fanout: fanout,
     holdingAccount: holding,
     fanoutForMint: fanoutForMint,
     fanoutForMintMembershipVoucher: fanoutForMintMembershipVoucher,
     fanoutMint: fanoutMint.mint,
     fanoutMintMemberTokenAccount: fanoutMintMemberTokenAccount
    }

    const dixIx: DistributeWalletInstructionDataArgs = {
      distributeForMint: false
    }

    const distribute = distributeWallet(umi, {...dixAcc, ...dixIx })
  }

  myFunction()
})();

