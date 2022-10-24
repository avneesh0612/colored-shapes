import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useOwnedNFTs,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Theme.module.css";
import { colorsAddress, shapesAddress, wrapAddress } from "../consts/addresses";

const Wrap: NextPage = () => {
  const { contract: wrapContract } = useContract(wrapAddress, "multiwrap");
  const { contract: colorsContract } = useContract(colorsAddress);
  const { contract: shapesContract } = useContract(shapesAddress);
  const [selectedShape, setSelectedShape] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const address = useAddress();
  const { data: shapedNFTs, isLoading: isLoadingShapes } = useOwnedNFTs(
    shapesContract,
    address
  );
  const { data: coloredNFTs, isLoading: isLoadingColors } = useOwnedNFTs(
    colorsContract,
    address
  );
  const [loading, setLoading] = useState(false);

  const wrap = async () => {
    try {
      setLoading(true);
      const shapeNFT = await shapesContract?.erc721.get(selectedShape);
      const colorNFT = await colorsContract?.erc1155.get(selectedColor);

      if (!shapeNFT || !colorNFT) {
        return;
      }

      const svgContentShapeReq = await fetch(shapeNFT.metadata.image!);

      const svgContentShape = await svgContentShapeReq.text();

      const newSvg = svgContentShape.replace(
        /fill="none"/g,
        // @ts-ignore
        `fill="#${colorNFT.metadata?.attributes[0]?.value}"`
      );

      const hasApprovalShapes = await shapesContract?.call(
        "isApprovedForAll",
        address,
        wrapAddress
      );

      if (!hasApprovalShapes) {
        await shapesContract?.call("setApprovalForAll", wrapAddress, true);
      }

      const hasApprovalColors = await colorsContract?.call(
        "isApprovedForAll",
        address,
        wrapAddress
      );

      if (!hasApprovalColors) {
        await colorsContract?.call("setApprovalForAll", wrapAddress, true);
      }

      const tx = await wrapContract?.wrap(
        {
          erc721Tokens: [
            {
              contractAddress: shapesAddress,
              tokenId: selectedShape,
            },
          ],
          erc1155Tokens: [
            {
              contractAddress: colorsAddress,
              tokenId: selectedColor,
              quantity: 1,
            },
          ],
        },
        {
          name: `${colorNFT.metadata.name} ${shapeNFT.metadata.name}`,
          description: "Colored Shape",
          image: newSvg,
        }
      );

      const receipt = tx?.receipt;
      const wrappedTokenId = tx?.id;

      console.log(receipt, wrappedTokenId);
      alert("Wrapped!");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {address ? (
        <>
          <h1>Wrap</h1>
          <h2>Shape</h2>
          {isLoadingShapes && <p>Loading...</p>}
          {shapedNFTs && (
            <div className={styles.cards}>
              {shapedNFTs.map((nft) => (
                <div
                  key={nft.metadata.id}
                  className={`${styles.card} ${styles.wrapCard}`}
                >
                  <ThirdwebNftMedia
                    metadata={nft.metadata}
                    className={styles.image}
                  />
                  <p>{nft.metadata.name}</p>
                  <button
                    className={styles.button}
                    onClick={() => setSelectedShape(Number(nft.metadata.id))}
                  >
                    {selectedShape === Number(nft.metadata.id)
                      ? "Selected"
                      : "Select"}
                  </button>
                </div>
              ))}
            </div>
          )}
          <h2>Color</h2>
          {isLoadingColors && <p>Loading...</p>}
          {coloredNFTs && (
            <div className={styles.cards}>
              {coloredNFTs.map((nft) => (
                <div
                  key={nft.metadata.id}
                  className={`${styles.card} ${styles.wrapCard}`}
                >
                  <ThirdwebNftMedia
                    metadata={nft.metadata}
                    className={styles.image}
                  />
                  <p>{nft.metadata.name}</p>
                  <button
                    className={styles.button}
                    onClick={() => setSelectedColor(Number(nft.metadata.id))}
                  >
                    {selectedColor === Number(nft.metadata.id)
                      ? "Selected"
                      : "Select"}
                  </button>
                </div>
              ))}
            </div>
          )}
          <button className={styles.button} onClick={wrap}>
            {loading ? "Wrapping..." : "Wrap"}
          </button>
        </>
      ) : (
        <>
          <p>Please connect your wallet</p>
          <ConnectWallet />
        </>
      )}
    </div>
  );
};

export default Wrap;
