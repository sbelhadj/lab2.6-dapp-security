const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentHubSecure", function () {
  let PaymentHubSecure;
  let paymentHubSecure;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    PaymentHubSecure = await ethers.getContractFactory("PaymentHubSecure");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy the contract
    paymentHubSecure = await PaymentHubSecure.deploy();
    await paymentHubSecure.deployed();
  });

  it("Should deploy with the correct owner", async function () {
    expect(await paymentHubSecure.owner()).to.equal(owner.address);
  });

  it("Should allow deposits and update balances", async function () {
    // Deposit 1 ETH from addr1
    const depositAmount = ethers.utils.parseEther("1.0");
    await paymentHubSecure.connect(addr1).deposit({ value: depositAmount });

    // Check the balance of addr1 in the contract
    const balance = await paymentHubSecure.balances(addr1.address);
    expect(balance).to.equal(depositAmount);
  });

  it("Should allow withdrawals by the user", async function () {
    // Deposit 1 ETH from addr1
    const depositAmount = ethers.utils.parseEther("1.0");
    await paymentHubSecure.connect(addr1).deposit({ value: depositAmount });

    // Withdraw 0.5 ETH by addr1
    const withdrawAmount = ethers.utils.parseEther("0.5");
    await paymentHubSecure.connect(addr1).withdraw(withdrawAmount);

    // Check the balance of addr1 in the contract
    const balance = await paymentHubSecure.balances(addr1.address);
    expect(balance).to.equal(depositAmount.sub(withdrawAmount));
  });

  it("Should not allow withdrawals exceeding the balance", async function () {
    // Try to withdraw without depositing
    const withdrawAmount = ethers.utils.parseEther("1.0");
    await expect(paymentHubSecure.connect(addr1).withdraw(withdrawAmount)).to.be.revertedWith(
      "Insufficient balance"
    );
  });

  it("Should allow the owner to withdraw contract balance", async function () {
    // Deposit 1 ETH from addr1
    const depositAmount = ethers.utils.parseEther("1.0");
    await paymentHubSecure.connect(addr1).deposit({ value: depositAmount });

    // Check contract balance before owner's withdrawal
    const initialContractBalance = await ethers.provider.getBalance(paymentHubSecure.address);
    expect(initialContractBalance).to.equal(depositAmount);

    // Owner withdraws all funds
    await paymentHubSecure.connect(owner).withdrawAll();

    // Check contract balance after withdrawal
    const finalContractBalance = await ethers.provider.getBalance(paymentHubSecure.address);
    expect(finalContractBalance).to.equal(0);
  });

  it("Should not allow non-owner to withdraw contract balance", async function () {
    await expect(paymentHubSecure.connect(addr1).withdrawAll()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });
});
