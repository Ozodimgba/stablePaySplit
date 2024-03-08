import { Fanout, FanoutClient, MembershipModel } from "@glasseaters/hydra-sdk";
import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { NodeWallet } from "@project-serum/common";
import {
    Account,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import base58 from "bs58";

type BuiltNftFanout = {
  fanout: PublicKey;
  name: string;
  fanoutAccountData: Fanout;
  members: NftFanoutMember[];
};
type NftFanoutMember = {
  voucher: PublicKey;
  mint: PublicKey;
  wallet: Keypair;
};


type BuiltWalletFanout = {
    fanout: PublicKey;
    name: string;
    fanoutAccountData: Fanout;
    members: WalletFanoutMember[];
  };
  type WalletFanoutMember = {
    voucher: PublicKey;
    wallet: Keypair;
  };

export async function builtWalletFanout(

    shares: number,
    numberMembers: number
  ): Promise<BuiltWalletFanout> {

    console.log( shares, numberMembers)
    const connection = new Connection(clusterApiUrl('devnet'), "confirmed");
    let authorityWallet: Keypair;
    let fanoutSdk: FanoutClient;

    const walletBytes = base58.decode(``)
    authorityWallet = Keypair.fromSecretKey(walletBytes)

   fanoutSdk = new FanoutClient(
        connection,
        new NodeWallet(new Account(authorityWallet.secretKey))
    );

    const name = `Test${Date.now()}`;
    const init = await fanoutSdk.initializeFanout({
      totalShares: shares,
      name,
      membershipModel: MembershipModel.Wallet,
    });

    console.log(init)
    let memberShare = shares / numberMembers;
    
    let ixs: TransactionInstruction[] = [];
    let members: WalletFanoutMember[] = [];

    const memberWallet = new Keypair();
      console.log("member: " + memberWallet.publicKey.toBase58());

    for (let i = 0; i < numberMembers; i++) {
  
      const ix = await fanoutSdk.addMemberWalletInstructions({
        fanout: init.fanout,
        fanoutNativeAccount: init.nativeAccount,
        membershipKey: memberWallet.publicKey,
        shares: memberShare,
      });

      members.push({
        voucher: ix.output.membershipAccount,
        wallet: memberWallet,
      });
      ixs.push(...ix.instructions);
    }
    const tx = await fanoutSdk.sendInstructions(
      ixs,
      [],
      fanoutSdk.wallet.publicKey
    );
  
   console.log("txxxxx: " + tx.TransactionSignature);


    if (tx.RpcResponseAndContext.value.err === null) {
      const txdetails = await fanoutSdk.connection.getConfirmedTransaction(
        tx.TransactionSignature
      );
      console.log(txdetails, tx.RpcResponseAndContext.value.err, tx.TransactionSignature);
    }
    const fanoutAccount = await fanoutSdk.fetch<Fanout>(init.fanout, Fanout);

    const transferAmount = 0.1 * LAMPORTS_PER_SOL;
    const transaction = new Transaction();
    transaction.add(
    SystemProgram.transfer({
        fromPubkey: authorityWallet.publicKey,
        toPubkey: fanoutAccount.accountKey,
        lamports: transferAmount,
    })
    );

   
    const sendTx = await sendAndConfirmTransaction(connection, transaction, [authorityWallet])

    console.log("sendTx: " + sendTx)

    let distMember1 = await fanoutSdk.distributeWalletMemberInstructions({
        distributeForMint: false,
        member: memberWallet.publicKey,
        fanout: init.fanout,
        payer: authorityWallet.publicKey,
    });

    const distx = await fanoutSdk.sendInstructions(
        [...distMember1.instructions],
        [authorityWallet],
        authorityWallet.publicKey
    );

    console.log("distTx: " + distx.TransactionSignature)
    
    return {
      fanout: init.fanout,
      name,
      fanoutAccountData: fanoutAccount,
      members: members,
    };
  }

  builtWalletFanout(100, 1)