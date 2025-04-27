import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("PaymentHubSecureUpgradeable", function () {
    let paymentHub: any;
    let owner: any;
    let user1: any;
    let user2: any;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const PaymentHub = await ethers.getContractFactory("PaymentHubSecureUpgradeable");
        paymentHub = await upgrades.deployProxy(PaymentHub, [owner.address], { initializer: "initialize" });
    });

    it("devrait s'initialiser correctement", async function () {
        expect(await paymentHub.owner()).to.equal(owner.address);
    });

    it("devrait permettre un dépôt et mettre à jour le solde", async function () {
        await paymentHub.connect(user1).deposit({ value: ethers.parseEther("1") });
        expect(await paymentHub.balances(user1.address)).to.equal(ethers.parseEther("1"));
    });

    it("devrait permettre un envoi de paiement", async function () {
        await paymentHub.connect(user1).deposit({ value: ethers.parseEther("2") });
        await paymentHub.connect(user1).sendPayment(user2.address, ethers.parseEther("1"));
        expect(await paymentHub.balances(user1.address)).to.equal(ethers.parseEther("1"));
    });

    it("devrait permettre un retrait utilisateur", async function () {
        await paymentHub.connect(user1).deposit({ value: ethers.parseEther("1") });
        await paymentHub.connect(user1).withdraw(ethers.parseEther("1"));
        expect(await paymentHub.balances(user1.address)).to.equal(0);
    });

    it("devrait seulement permettre à l'opérateur de suspendre", async function () {
        await expect(paymentHub.connect(user1).pauseHub()).to.be.reverted;
        await expect(paymentHub.connect(owner).pauseHub()).to.not.be.reverted;
    });

    it("devrait upgrader vers V2 et retourner la bonne version", async function () {
        const PaymentHubV2 = await ethers.getContractFactory("PaymentHubSecureUpgradeableV2");
        const upgraded = await upgrades.upgradeProxy(await paymentHub.getAddress(), PaymentHubV2);
    
        expect(await upgraded.version()).to.equal("V2");
    });
});