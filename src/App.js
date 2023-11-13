import axios from "axios";
import { useState, useEffect } from "react";
import { Button, Card, Col, Row } from "antd";
import styles from "./styles/Home.module.css";
import Logo from "./img/EntergateLogo2.svg";
import { ethers } from "ethers";
import "./App.css";
// import Entergate from "./artifacts/contracts/EntergateNFT.sol/EntergateNFT.json";
import EntergateMarket from "./artifacts/contracts/EntergateMarket.sol/EntergateMarket.json";
import EntergateNFT from "./artifacts/contracts/EntergateNFT.sol/EntergateNFT.json";
import EntergateData from "./entergate-data.json";

function App() {
  // const { Meta } = Card;
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("0x0");
  const [signer, setSigner] = useState();
  const [balance, setBalance] = useState("0");

  const [marketAddress, setMarketAddress] = useState();
  const [nftAddress, setNFTAddress] = useState();
  const [userIDMarket, setUserIDMarket] = useState();
  const [entergateAddress, setEntergateAddress] = useState();
  const [inputMarketAddress, setInputMarketAddress] = useState();
  const [nftName, setNftName] = useState();
  const [nftSymbol, setNftSymbol] = useState();
  const [nftDesc, setNftDesc] = useState();
  const [quantity, setQuantity] = useState();
  const [urlImage, setURLImage] = useState();
  const [buyQty, setBuyQty] = useState();
  const [profileDetail, setProfileDetail] = useState();
  const [allNFTS, setAllNFTS] = useState();

  const [nftPriceETH, setNFTPriceETH] = useState("0");
  const [nftPriceWEI, setNFTPriceWEI] = useState("0");

  const [serviceFee, setServiceFee] = useState("0");
  const [payToSeller, setPayToSeller] = useState("0");
  const [payToHost, setPayToHost] = useState("0");
  const [serviceFeeSolidity, setServiceFeeSolidity] = useState("0");

  const [totalTokenID, setTotalTokenID] = useState("0");
  const [myNFT, setMyNFT] = useState();

  useEffect(() => {
    console.log("account: ", account);
    console.log("balance: ", balance, "ETH");
  }, [account]);

  async function handleConnect() {
    try {
      if (isConnected) {
        setIsConnected(false);
        setAccount("0x0");
        setSigner();
      } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const acc = await provider.send("eth_requestAccounts", []);
        const sign = provider.getSigner(acc[0]);
        let accBal = ethers.utils.formatEther(await sign.getBalance());
        accBal = parseFloat(accBal).toFixed(4);
        // const price = provider.getEtherPrice();
        // console.log("Ether price in USD: " + price);
        setIsConnected(true);
        setAccount(acc[0]);
        setSigner(sign);
        setBalance(accBal);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function deployMarket() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // const args = [userIDMarket, entergateAddress];
      // console.log("args: ", args);

      try {
        const factory = new ethers.ContractFactory(
          EntergateMarket.abi,
          EntergateMarket.bytecode,
          signer
        );
        // const contract = await factory.deploy(args);
        console.log("Starting deploy process");
        const contract = await factory.deploy(userIDMarket, entergateAddress);
        // console.log("Waiting payment process...");
        await contract.deployed();
        console.log("Market Contract deployed to:", contract.address);
        console.log("Waiting for blocks confirmations...");
        await contract.deployTransaction.wait(6);
        console.log("Confirmed!");

        setMarketAddress(await contract.address);
      } catch (error) {
        console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
      }
    }
  }

  async function deployNFT() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // const args = [userIDMarket, entergateAddress];
      // console.log("args: ", args);

      try {
        const factory = new ethers.ContractFactory(
          EntergateNFT.abi,
          EntergateNFT.bytecode,
          signer
        );
        // const contract = await factory.deploy(args);
        console.log("Starting deploy process");
        const contract = await factory.deploy(
          inputMarketAddress,
          nftName,
          nftSymbol,
          nftDesc
          // quantity,
          // urlImage,
          // extImage,
          // { gasLimit: 1000000 }
        );

        // console.log("Waiting payment process...");
        await contract.deployed();
        console.log("NFT Contract deployed to:", contract.address);
        console.log("Waiting for blocks confirmations...");
        const transactionReceipt = await contract.deployTransaction.wait(6);
        const { gasUsed, effectiveGasPrice } = transactionReceipt;
        let gasCost = ethers.utils.formatEther(gasUsed.mul(effectiveGasPrice));
        gasCost = parseFloat(gasCost).toFixed(6);

        console.log("gasUsed: ", parseInt(gasUsed, 10));
        console.log(
          "effectiveGasPrice: ",
          parseInt(effectiveGasPrice, 10),
          "WEI"
        );
        console.log("gasCost: ", gasCost, "ETH");
        console.log("Confirmed!");

        setNFTAddress(await contract.address);
      } catch (error) {
        console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
      }
    }
  }

  async function mintingNFT() {
    console.log("Starting minting NFT");
    try {
      const nftContract = new ethers.Contract(
        nftAddress,
        EntergateNFT.abi,
        signer
      );
      let tx = await nftContract.mintNfts(quantity, urlImage);
      console.log("Waiting for blocks confirmations...");
      const transactionReceipt = await tx.wait(2);
      const { gasUsed, effectiveGasPrice, transactionHash } =
        transactionReceipt;
      let gasCost = ethers.utils.formatEther(gasUsed.mul(effectiveGasPrice));
      gasCost = parseFloat(gasCost).toFixed(6);

      console.log("gasUsed: ", parseInt(gasUsed, 10));
      console.log(
        "effectiveGasPrice: ",
        parseInt(effectiveGasPrice, 10),
        "WEI"
      );
      console.log("gasCost: ", gasCost, "ETH");
      console.log("Confirmed! ", transactionHash);
    } catch (error) {
      console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
    }
  }

  async function publishNFT() {
    console.log("Starting publish NFT");
    try {
      const nftContract = new ethers.Contract(
        inputMarketAddress,
        EntergateMarket.abi,
        signer
      );
      // const gasPrice = await signer.gasPrice();
      // const gasLimit = await nftContract.estimateGas.registerNftBulk(
      //   nftAddress,
      //   nftName,
      //   nftDesc,
      //   quantity,
      //   nftPriceWEI,
      //   serviceFeeSolidity,
      //   urlImage
      // );
      // console.log("gasPrice: ", gasPrice);
      // console.log("gasLimit: ", gasLimit);

      let tx = await nftContract.registerNftBulk(
        nftAddress,
        nftName,
        nftDesc,
        quantity,
        nftPriceWEI,
        serviceFeeSolidity,
        urlImage,
        { gasLimit: 10000000 }
      );

      console.log("Waiting for blocks confirmations...");
      const transactionReceipt = await tx.wait(2);
      const { gasUsed, effectiveGasPrice, transactionHash } =
        transactionReceipt;
      let gasCost = ethers.utils.formatEther(gasUsed.mul(effectiveGasPrice));
      gasCost = parseFloat(gasCost).toFixed(6);

      console.log("gasUsed: ", parseInt(gasUsed, 10));
      console.log(
        "effectiveGasPrice: ",
        parseInt(effectiveGasPrice, 10),
        "WEI"
      );
      console.log("gasCost: ", gasCost, "ETH");
      console.log("Confirmed! ", transactionHash);
    } catch (error) {
      console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
    }
  }

  async function calcPrice() {
    let c_serviceFee = serviceFee;

    let c_PayToHost = (nftPriceWEI * c_serviceFee) / parseFloat(10000);
    // c_PayToHost = (+c_PayToHost).toFixed(6);
    // c_PayToHost = Math.round(c_PayToHost * 1e4) / 1e4;
    // c_PayToHost = Math.trunc(c_PayToHost);
    let c_PayToSeller = nftPriceWEI - c_PayToHost;
    // c_PayToSeller = (+c_PayToSeller).toFixed(18);

    setPayToHost(c_PayToHost);
    setPayToSeller(c_PayToSeller);
  }

  async function getProfileNft() {
    console.log("Starting getProfileNft");
    try {
      const nftContract = new ethers.Contract(
        inputMarketAddress,
        EntergateMarket.abi,
        signer
      );
      const contractArr = await nftContract.getContractArr();
      const profileOutput = await Promise.all(
        contractArr.map(async (nftsAddr) => {
          console.log("NFTS Addr: ", nftsAddr);
          const profileNft = await nftContract.getProfileNft(nftsAddr);
          // console.log("profileNft: ", profileNft);
          console.log("nftContract: ", profileNft.nftContract);
          console.log("profileImage: ", profileNft.profileImage);
          let image = profileNft.profileImage.replace(
            "ipfs://",
            "https://ipfs.io/ipfs/"
          );

          const nft = {
            nftContract: profileNft.nftContract,
            name: profileNft.name,
            description: profileNft.description,
            profileImage: image,
            totalNFT: parseInt(profileNft.totalNFT, 10),
            sell: parseInt(profileNft.sell, 10),
            sold: parseInt(profileNft.sold, 10),
            price: ethers.utils.formatEther(profileNft.price),
            serviceFee: profileNft.serviceFee / 10000,
          };
          return nft;
        })
      );
      console.log("profileOutput: ", profileOutput);
      setProfileDetail(profileOutput);
    } catch (error) {
      console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
    }
  }

  async function buyNFT() {
    console.log("Starting buy NFT");
    try {
      const nftContract = new ethers.Contract(
        inputMarketAddress,
        EntergateMarket.abi,
        signer
      );
      let totalPrice = nftPriceETH * buyQty;
      totalPrice = ethers.utils
        .parseUnits(totalPrice.toString(), "ether")
        .toString();
      console.log("totalPrice: ", totalPrice);
      let tx = await nftContract.buyNft(
        nftAddress,
        buyQty,
        {
          value: ethers.BigNumber.from(totalPrice),
          gasLimit: 10000000,
        }
        // { gasLimit: 10000000 }
      );

      console.log("Waiting for blocks confirmations...");
      await tx.wait(2);
      console.log("Confirmed!");
    } catch (error) {
      console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
    }
  }

  async function viewMyNFT() {
    const itemArray = [];
    console.log("Starting View My NFT");
    try {
      const nftContract = new ethers.Contract(
        nftAddress,
        EntergateNFT.abi,
        signer
      );

      const myAddress = await signer.getAddress();
      const balance = ethers.utils.formatEther(await signer.getBalance());
      const tokenBalanceOf = parseInt(await nftContract.balanceOf(myAddress));
      console.log("myAddress: ", myAddress);
      console.log("balance: ", balance);
      console.log("tokenBalanceOf: ", tokenBalanceOf);

      for (let i = 0; i < tokenBalanceOf; i++) {
        const tokenId = i;
        const owner = await nftContract.ownerOf(tokenId);
        const rawUri = await nftContract.tokenURI(tokenId);
        console.log("owner: ", owner);
        console.log("rawUri: ", rawUri);

        const meta = await axios.get(rawUri);
        console.log("metadata: ", meta);
        const metaName = await meta.data.name;
        console.log("name: ", metaName);
        const metaDesc = await meta.data.description;
        console.log("name: ", metaDesc);
        const metaImg = await meta.data.image.replace(
          "ipfs://",
          "https://ipfs.io/ipfs/"
        );
        console.log("metaImg: ", metaImg);

        const nft = {
          name: metaName,
          description: metaDesc,
          profileImage: metaImg,
        };
        itemArray.push(nft);
      }
      setMyNFT(itemArray);
    } catch (error) {
      console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
    }
  }

  async function adminViewNFT() {
    const itemArray = [];
    EntergateData.map(async (EntergateData, index) => {
      // console.log("index: ", index);
      // console.log("userid: ", EntergateData.userid);
      console.log("marketcontract: ", EntergateData.marketcontract);

      try {
        const nftContract = new ethers.Contract(
          EntergateData.marketcontract,
          EntergateMarket.abi,
          signer
        );
        const contractArr = await nftContract.getContractArr();
        // console.log("contractArr: ", contractArr);

        const profileOutput = await Promise.all(
          contractArr.map(async (nftsAddr) => {
            console.log("NFTS Addr: ", nftsAddr);
            const profileNft = await nftContract.getProfileNft(nftsAddr);
            // console.log("profileNft: ", profileNft);
            // console.log("nftContract: ", profileNft.nftContract);
            // console.log("profileImage: ", profileNft.profileImage);
            let image = profileNft.profileImage.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );

            const nft = {
              userid: EntergateData.userid,
              marketContract: EntergateData.marketcontract,
              nftContract: profileNft.nftContract,
              name: profileNft.name,
              description: profileNft.description,
              profileImage: image,
              totalNFT: parseInt(profileNft.totalNFT, 10),
              sell: parseInt(profileNft.sell, 10),
              sold: parseInt(profileNft.sold, 10),
              price: ethers.utils.formatEther(profileNft.price),
              serviceFee: profileNft.serviceFee / 10000,
            };
            itemArray.push(nft);
            return nft;
          })
        );
        // console.log("profileOutput: ", profileOutput);
        // setProfileDetail(profileOutput);
      } catch (error) {
        console.log("error >>>>>>>>>>>>>>>>>>>>>>>>>>>:", error);
      }
    });
    await new Promise((r) => setTimeout(r, 5000));
    setAllNFTS(itemArray);
    console.log("adminNFTS: ", allNFTS);
  }

  const renderedMyNft =
    myNFT &&
    Object.values(myNFT).map((value) => {
      return (
        <Col span={6}>
          <Card
            cover={<img alt="example" src={value.profileImage} />}
            title={value.name}
            bordered={false}
            style={{ width: 280, marginTop: 30 }}
          >
            {value.description}
          </Card>
        </Col>
      );
    });

  const renderedProfileNft =
    profileDetail &&
    Object.values(profileDetail).map((nft) => {
      const buyInQtyChange = (event) => {
        setBuyQty(event.target.value);
        setNFTAddress(nft.nftContract);
        setNFTPriceETH(nft.price);
      };

      return (
        <div className="nfts">
          <Card
            className="horizontal-card result-card"
            hoverable
            cover={<img alt="example" src={nft.profileImage} />}
            size="small"
          >
            <h2>{nft.name}</h2>
            {nft.description}
            <p />
            <b>NFT Contract:</b> {nft.nftContract}
            <br />
            <b>Total NFT:</b> {nft.totalNFT}
            <br />
            <b>Stock:</b> {nft.sell}
            <br />
            <b>Sold:</b> {nft.sold}
            <br />
            <b>Price:</b> {nft.price} ETH
            <br />
            <b>Service Fee:</b> {nft.serviceFee} %
            <p />
            Buy Qty: <input
              type="text"
              size="2"
              onChange={buyInQtyChange}
            />{" "}
            <Button type="primary" onClick={buyNFT}>
              Buy
            </Button>
          </Card>
        </div>
      );
    });

  const renderedAdminView =
    allNFTS &&
    Object.values(allNFTS).map((nft) => {
      const buyInQtyChange = (event) => {
        setBuyQty(event.target.value);
        setNFTAddress(nft.nftContract);
        setNFTPriceETH(nft.price);
        console.log("renderedAdminView");
      };

      return (
        <div className="nfts">
          <Card
            className="horizontal-card result-card"
            hoverable
            cover={<img alt="example" src={nft.profileImage} />}
            size="small"
          >
            <h2>{nft.name}</h2>
            {nft.description}
            <p />
            <b>Market Contract:</b> {nft.marketContract}
            <br />
            <b>User ID:</b> {nft.userid}
            <br />
            <b>NFT Contract:</b> {nft.nftContract}
            <br />
            <b>Total NFT:</b> {nft.totalNFT}
            <br />
            <b>Stock:</b> {nft.sell}
            <br />
            <b>Sold:</b> {nft.sold}
            <br />
            <b>Price:</b> {nft.price} ETH
            <br />
            <b>Service Fee:</b> {nft.serviceFee} %
            <p />
            Buy Qty: <input
              type="text"
              size="2"
              onChange={buyInQtyChange}
            />{" "}
            <Button type="primary" onClick={buyNFT}>
              Buy
            </Button>
          </Card>
        </div>
      );
    });

  const renderedBuyNfts =
    allNFTS &&
    Object.values(allNFTS).map((value) => {
      const buyInQtyChange = (event) => {
        setBuyQty(event.target.value);
        setNFTAddress(value.nftContract);
        setNFTPriceETH(value.price);
      };
      return (
        <Col span={6}>
          <Card
            cover={<img alt="example" src={value.profileImage} />}
            title={value.name}
            bordered={false}
            style={{ width: 280, marginTop: 30 }}
          >
            {value.description}
            <br />
            <b>Stock:</b> {value.sell}
            <br />
            <b>Sold:</b> {value.sold}
            <br />
            <b>Price:</b> {value.price} ETH
            <br />
            Buy Qty: <input
              type="text"
              size="2"
              onChange={buyInQtyChange}
            />{" "}
            <Button type="primary" onClick={buyNFT}>
              Buy
            </Button>
          </Card>
        </Col>
      );
    });

  const userIDChange = (event) => {
    setUserIDMarket(event.target.value);
  };

  const entergateAddressChange = (event) => {
    setEntergateAddress(event.target.value);
  };

  const inputMarketChange = (event) => {
    setInputMarketAddress(event.target.value);
  };

  const nftNameChange = (event) => {
    setNftName(event.target.value);
  };

  const nftSymbolChange = (event) => {
    setNftSymbol(event.target.value);
  };

  const nftDescChange = (event) => {
    setNftDesc(event.target.value);
  };

  const nftAddressChange = (event) => {
    setNFTAddress(event.target.value);
  };

  const nftQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  const urlImageChange = (event) => {
    setURLImage(event.target.value);
  };

  const nftPriceChange = (event) => {
    setNFTPriceETH(event.target.value);
    setNFTPriceWEI(
      ethers.utils.parseUnits(event.target.value, "ether").toString()
    );
  };

  const serviceFeeChange = (event) => {
    // const balance = ethers.BigNumber.from(ethers.utils.parseEther("1"));
    setServiceFee(
      // ethers.utils.parseUnits(event.target.value, "ether").toString()
      event.target.value
    );
    setServiceFeeSolidity(event.target.value * 100);
  };

  const buyQtyChange = (event) => {
    setBuyQty(event.target.value);
  };

  const totalTokenIDChange = (event) => {
    setTotalTokenID(event.target.value);
  };

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.moralis_logo}>
          <img src={Logo} alt="Logo" width="102" height="82" />
        </div>
        <p>
          <b>ENTERGATE SMARTCONTRACT FUNCTION TEST</b>
        </p>
        <button onClick={handleConnect} className={styles.connect_button}>
          {isConnected ? "Connected" : "Connect Wallet"}
        </button>
      </div>
      <label>
        <p>
          <h2>CREATE USER ORGANIZER</h2>
        </p>
        User ID: <input type="text" onChange={userIDChange} /> <br />
        Entergate Address:{" "}
        <input type="text" size="60" onChange={entergateAddressChange} /> ex:
        0x1C94cea3F942352740E2066A588929148C2bD6e1
        <br />
      </label>
      <br />
      <button className={styles.body_button} onClick={deployMarket}>
        Create Market Contract
      </button>
      <p />
      <b>Market Contract Address: {marketAddress}</b>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <label>
        <p>
          <h2>CREATE EVENT</h2>
        </p>
        Market Contract:{" "}
        <input
          type="text"
          size="60"
          value={inputMarketAddress}
          onChange={inputMarketChange}
        />
        <br />
        NFT Name: <input
          type="text"
          value={nftName}
          onChange={nftNameChange}
        />{" "}
        ex: MotoGP 2023
        <br />
        NFT Symbol: <input type="text" onChange={nftSymbolChange} /> ex: MGP
        <br />
        NFT Description:{" "}
        <input type="text" value={nftDesc} onChange={nftDescChange} /> ex: The
        MotoGP World Championship
        <br />
      </label>
      <br />
      <button className={styles.body_button} onClick={deployNFT}>
        Create Event NFT Contract
      </button>
      <p />
      <b>NFT Contract Address: {nftAddress}</b>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <label>
        <p>
          <h2>MINTING NFT</h2>
        </p>
        NFT Contract:{" "}
        <input
          type="text"
          size="60"
          value={nftAddress}
          onChange={nftAddressChange}
        />
        <br />
        NFT Quantity:{" "}
        <input type="text" size="5" onChange={nftQuantityChange} /> ex: 5
        <br />
        Image URL: <input type="text" size="60" onChange={urlImageChange} /> ex:
        ipfs://QmW3yT4hKAer3KDfSriiQcu2Zno6fLodmxyaAyYT2eFRyf/MotoGP2023.png
        <br />
      </label>
      <p />
      <button className={styles.body_button} onClick={mintingNFT}>
        Minting NFT
      </button>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <label>
        <p>
          <h2>PUBLISH NFT TO MARKET</h2>
        </p>
        Market Contract:{" "}
        <input
          type="text"
          size="60"
          value={inputMarketAddress}
          onChange={inputMarketChange}
        />
        <br />
        NFT Contract:{" "}
        <input
          type="text"
          size="60"
          value={nftAddress}
          onChange={nftAddressChange}
        />
        <br />
        NFT Name: <input
          type="text"
          value={nftName}
          onChange={nftNameChange}
        />{" "}
        ex: MotoGP 2023
        <br />
        NFT Description:{" "}
        <input
          type="text"
          size="60"
          value={nftDesc}
          onChange={nftDescChange}
        />{" "}
        ex: The MotoGP World Championship
        <br />
        NFT Quantity:
        <input type="text" value={quantity} onChange={nftQuantityChange} /> ex:
        5
        <br />
        Price: <input type="text" onChange={nftPriceChange} /> ex: 0.05 ETH |{" "}
        Value: {nftPriceWEI} WEI
        <br />
        Image URL:{" "}
        <input
          type="text"
          size="60"
          value={urlImage}
          onChange={urlImageChange}
        />{" "}
        ex: ipfs://QmW3yT4hKAer3KDfSriiQcu2Zno6fLodmxyaAyYT2eFRyf/MotoGP2023.png
        <br />
        Service Fee:{" "}
        <select value={serviceFee} onChange={serviceFeeChange}>
          <option value="">Select Fee</option>
          <option value="8">8%</option>
          <option value="12">12%</option>
          <option value="16">16%</option>
          <option value="24">24%</option>
          <option value="28">28%</option>
        </select>{" "}
        Value: {serviceFeeSolidity}
        <br />
      </label>
      <p />
      <button onClick={calcPrice}>Calc Price</button>
      <br />
      Pay to Entergate: {payToHost} WEI
      <br />
      Pay to Seller: {payToSeller} WEI
      <p />
      <button className={styles.body_button} onClick={publishNFT}>
        PUBLISH NFT
      </button>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <label>
        <p>
          <h2>BUY NFT</h2>
        </p>
        Market Contract:{" "}
        <input
          type="text"
          size="60"
          value={inputMarketAddress}
          onChange={inputMarketChange}
        />
        <br />
        NFT Contract:{" "}
        <input
          type="text"
          size="60"
          value={nftAddress}
          onChange={nftAddressChange}
        />
        <br />
        Buy Quantity: <input type="text" onChange={buyQtyChange} /> ex: 2
        <br />
      </label>
      <br />
      <button className={styles.body_button} onClick={buyNFT}>
        Buy NFT
      </button>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <label>
        <p>
          <h2>NFT Gallery for User Organizer</h2>
        </p>
        Market Contract:{" "}
        <input
          type="text"
          size="60"
          value={inputMarketAddress}
          onChange={inputMarketChange}
        />
        <br />
      </label>
      <br />
      <button className={styles.body_button} onClick={getProfileNft}>
        getProfileNft
      </button>
      <p />
      <div className="results">
        <div className="nfts">{renderedProfileNft}</div>
      </div>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <p />
      <label>
        <p>
          <h2>My NFT Gallery (Regular User)</h2>
        </p>
        NFT Contract:{" "}
        <input
          type="text"
          size="60"
          value={nftAddress}
          onChange={nftAddressChange}
        />
        <br />
      </label>
      <br />
      <button className={styles.body_button} onClick={viewMyNFT}>
        My NFT
      </button>
      <p />
      <div className="results">
        <div style={{ background: "#ECECEC", padding: "20px" }}>
          <Row gutter={16}>{renderedMyNft}</Row>
        </div>
      </div>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <p />
      <label>
        <p>
          <h2>All NFTS (Admin User)</h2>
        </p>
      </label>
      <br />
      <button className={styles.body_button} onClick={adminViewNFT}>
        Load NFTS for Admin
      </button>
      <p />
      <div className="results">
        <div className="nfts">{renderedAdminView}</div>
      </div>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <label>
        <p>
          <h2>Buy NFTS (Regular User)</h2>
        </p>
      </label>
      <br />
      <button className={styles.body_button} onClick={adminViewNFT}>
        Load NFTS
      </button>
      <p />
      <div className="results">
        <div style={{ background: "#ECECEC", padding: "20px" }}>
          <Row gutter={16}>{renderedBuyNfts}</Row>
        </div>
      </div>
      <p />
      <div
        style={{
          borderTop: "2px solid #000 ",
        }}
      ></div>
      <p /> <p />{" "}
    </div>
  );
}

export default App;
