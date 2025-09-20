import { expect } from "chai";
import { ethers } from "hardhat";
import { RightsFactory, VideoRightsToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RightsFactory", function () {
  let factory: RightsFactory;
  let creator: SignerWithAddress;
  let buyer: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  beforeEach(async function () {
    [creator, buyer, otherAccount] = await ethers.getSigners();

    const RightsFactory = await ethers.getContractFactory("RightsFactory");
    factory = await RightsFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("Token Creation", function () {
    it("Should create a new video rights token", async function () {
      const tx = await factory.connect(creator).createToken(
        "My Video Token",
        "MVT",
        1000,
        ethers.parseEther("0.1"),
        "https://youtube.com/watch?v=example",
        "signature:0x123;msg:I own this content"
      );

      await expect(tx).to.emit(factory, "TokenCreated");

      const allTokens = await factory.getAllTokens();
      expect(allTokens.length).to.equal(1);

      const tokenInfo = await factory.getTokenInfo(allTokens[0]);
      expect(tokenInfo.creator).to.equal(creator.address);
      expect(tokenInfo.totalSupply).to.equal(1000);
      expect(tokenInfo.pricePerToken).to.equal(ethers.parseEther("0.1"));
    });

    it("Should reject invalid token creation parameters", async function () {
      await expect(
        factory.connect(creator).createToken(
          "Invalid Token",
          "INV",
          0, // Invalid: zero supply
          ethers.parseEther("0.1"),
          "https://youtube.com/watch?v=example",
          ""
        )
      ).to.be.revertedWith("Total supply must be greater than 0");

      await expect(
        factory.connect(creator).createToken(
          "Invalid Token",
          "INV",
          1000,
          0, // Invalid: zero price
          "https://youtube.com/watch?v=example",
          ""
        )
      ).to.be.revertedWith("Price per token must be greater than 0");
    });
  });

  describe("Token Purchase", function () {
    let tokenAddress: string;

    beforeEach(async function () {
      await factory.connect(creator).createToken(
        "Test Video Token",
        "TVT",
        1000,
        ethers.parseEther("0.1"),
        "https://youtube.com/watch?v=test",
        "signature:0x123;msg:I own this content"
      );

      const allTokens = await factory.getAllTokens();
      tokenAddress = allTokens[0];
    });

    it("Should allow users to purchase tokens", async function () {
      const purchaseAmount = 10;
      const totalCost = ethers.parseEther("1.0"); // 10 * 0.1 ETH

      await expect(
        factory.connect(buyer).purchaseTokens(tokenAddress, purchaseAmount, {
          value: totalCost,
        })
      ).to.emit(factory, "TokensPurchased");

      // Check buyer received tokens
      const token = await ethers.getContractAt("VideoRightsToken", tokenAddress);
      const buyerBalance = await token.balanceOf(buyer.address);
      expect(buyerBalance).to.equal(purchaseAmount);

      // Check creator earnings
      const creatorEarnings = await factory.getCreatorEarnings(creator.address);
      expect(creatorEarnings).to.equal(totalCost);
    });

    it("Should refund excess payment", async function () {
      const purchaseAmount = 10;
      const totalCost = ethers.parseEther("1.0");
      const excessPayment = ethers.parseEther("0.5");

      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await factory.connect(buyer).purchaseTokens(tokenAddress, purchaseAmount, {
        value: totalCost + excessPayment,
      });

      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      
      // Buyer should have paid exactly totalCost + gas
      expect(buyerBalanceBefore - buyerBalanceAfter).to.be.closeTo(
        totalCost + gasUsed,
        ethers.parseEther("0.001") // Allow for small rounding errors
      );
    });
  });

  describe("Creator Withdrawal", function () {
    let tokenAddress: string;

    beforeEach(async function () {
      await factory.connect(creator).createToken(
        "Test Video Token",
        "TVT",
        1000,
        ethers.parseEther("0.1"),
        "https://youtube.com/watch?v=test",
        "signature:0x123;msg:I own this content"
      );

      const allTokens = await factory.getAllTokens();
      tokenAddress = allTokens[0];

      // Make a purchase to generate earnings
      await factory.connect(buyer).purchaseTokens(tokenAddress, 10, {
        value: ethers.parseEther("1.0"),
      });
    });

    it("Should allow creators to withdraw earnings", async function () {
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      const earnings = await factory.getCreatorEarnings(creator.address);

      await expect(factory.connect(creator).withdrawEarnings())
        .to.emit(factory, "CreatorWithdraw")
        .withArgs(creator.address, earnings);

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      expect(creatorBalanceAfter).to.be.gt(creatorBalanceBefore);

      // Earnings should be reset to 0
      const earningsAfter = await factory.getCreatorEarnings(creator.address);
      expect(earningsAfter).to.equal(0);
    });
  });
});