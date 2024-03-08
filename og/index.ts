import {
    Account,
    Connection,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram
} from "@solana/web3.js";
import {NodeWallet} from "@project-serum/common"; //TODO remove this
import {
    ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
    Fanout,
    FanoutClient,
    FanoutMembershipMintVoucher,
    FanoutMembershipVoucher,
    FanoutMint,
    MembershipModel,
} from "@glasseaters/hydra-sdk";
import { builtWalletFanout } from "./utils/scenarios";
import base58 from "bs58";


(async() => {
    const connection = new Connection(clusterApiUrl('devnet'), "confirmed");
    let authorityWallet: Keypair;
    let fanoutSdk: FanoutClient;

    const walletBytes = base58.decode(``)
    authorityWallet = Keypair.fromSecretKey(walletBytes)
    fanoutSdk = new FanoutClient(
        connection,
        new NodeWallet(new Account(authorityWallet.secretKey))
    );

    const { fanout } = await fanoutSdk.initializeFanout({
        totalShares: 100,
        name: `Test${Date.now()}`,
        membershipModel: MembershipModel.Wallet,
    });
    
    let fanoutAccount = await fanoutSdk.fetch<Fanout>(fanout, Fanout);
   
    const {fanoutForMint, tokenAccount} =
                await fanoutSdk.initializeFanoutForMint({
                    fanout,
                    mint: NATIVE_MINT,
                });

            const fanoutMintAccount = await fanoutSdk.fetch<FanoutMint>(
                fanoutForMint,
                FanoutMint
            );

            console.log(fanoutMintAccount);
    
            const init = await fanoutSdk.initializeFanout({
                totalShares: 100,
                name: `Test${Date.now()}`,
                membershipModel: MembershipModel.Wallet,
            });
            const member = new Keypair();
            const {membershipAccount} = await fanoutSdk.addMemberWallet({
                fanout: init.fanout,
                fanoutNativeAccount: init.nativeAccount,
                membershipKey: member.publicKey,
                shares: 10,
            });
        fanoutAccount = await fanoutSdk.fetch<Fanout>(init.fanout, Fanout);

            const membershipAccountData =
                await fanoutSdk.fetch<FanoutMembershipVoucher>(
                    membershipAccount,
                    FanoutMembershipVoucher
                );
        
    
    let builtFanout = await builtWalletFanout(fanoutSdk, 100, 3);

    const transferAmount = 1 * LAMPORTS_PER_SOL;

    
    const transaction = new Transaction();
    transaction.add(
    SystemProgram.transfer({
        fromPubkey: authorityWallet.publicKey,
        toPubkey: builtFanout.fanoutAccountData.accountKey,
        lamports: transferAmount,
    })
    );

    let member1 = builtFanout.members[0];

   
    let distMember1 = await fanoutSdk.distributeWalletMemberInstructions({
        distributeForMint: false,
        member: member1.wallet.publicKey,
        fanout: builtFanout.fanout,
        payer: authorityWallet.publicKey,
    });

    console.log(distMember1.instructions)
    const tx = await fanoutSdk.sendInstructions(
        [...distMember1.instructions],
        [authorityWallet],
        authorityWallet.publicKey
    );
    
    if (!!tx.RpcResponseAndContext.value.err) {
        const txdetails = await connection.getConfirmedTransaction(
            tx.TransactionSignature
        );
        console.log(txdetails, tx.RpcResponseAndContext.value.err, tx.TransactionSignature);
    }
    //console.log("dist" + distMember1)
})();