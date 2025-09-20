# How to Deploy and Connect the Factory Contract

1. **Deploy the Factory Contract**

Open a terminal in your project root and run:

```sh
npx hardhat run scripts/deploy_factory.ts --network amoy
```

- This will deploy the `RightsFactory` contract to the Polygon Amoy Testnet.
- The deployed address will be printed in the terminal and saved in `deployments/amoy-deployment.json`.

2. **Update the Frontend Config**

Open `frontend/src/lib/config.js` and update the `FACTORY_ADDRESSES` object:

```
export const FACTORY_ADDRESSES = {
  80002: 'YOUR_DEPLOYED_FACTORY_ADDRESS', // Polygon Amoy
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia
};
```
Replace `YOUR_DEPLOYED_FACTORY_ADDRESS` with the address from the deployment output.

3. **Restart the Frontend**

```sh
cd frontend
npm run dev
```

4. **Access the App**

Go to the URL shown in the terminal (e.g., http://localhost:5173/ or http://localhost:5174/) and use the Create page.

---

**File for Create Video Rights Token UI:**
- `frontend/src/pages/Create.jsx`

**Factory Contract Address Config:**
- `frontend/src/lib/config.js`

If you see "Factory contract not deployed on this network", make sure the address is correct and you are connected to the right network in your wallet.
