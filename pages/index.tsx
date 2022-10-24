import {
  ThirdwebNftMedia,
  useContract,
  useNFTs,
  Web3Button,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { colorsAddress, shapesAddress } from "../consts/addresses";
import styles from "../styles/Theme.module.css";

const Home: NextPage = () => {
  const { contract } = useContract(colorsAddress);
  const { data: nfts, isLoading, error } = useNFTs(contract);

  return (
    <div className={styles.container}>
      <h1>Claim Shape</h1>
      <Web3Button
        action={(contract) => contract.erc721.claim(1)}
        contractAddress={shapesAddress}
        onError={(error) => console.log(error)}
        onSuccess={() => alert("Claimed!")}
      >
        Claim
      </Web3Button>

      <h1>Claim Color</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {nfts && (
        <div className={styles.cards}>
          {nfts.map((nft) => (
            <div key={nft.metadata.id} className={styles.card}>
              <ThirdwebNftMedia
                metadata={nft.metadata}
                className={styles.image}
              />
              <p>{nft.metadata.name}</p>

              <Web3Button
                action={(contract) =>
                  contract.erc1155.claim(nft.metadata.id, 1)
                }
                contractAddress={colorsAddress}
                onError={(error) => console.log(error)}
                onSuccess={() => alert("Claimed!")}
                className={styles.button}
              >
                Claim
              </Web3Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
