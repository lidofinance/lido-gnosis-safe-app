import React, { useCallback } from "react";
import styled from "styled-components";
import {
  Button,
  TextField,
  Title,
  Text,
  Card,
} from "@gnosis.pm/safe-react-components";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import * as yup from "yup";
import { Formik, Form } from "formik";
import { constants, utils } from "ethers";

import ABI from "./steth.abi.json";
import Logo from "./logo.svg";

const Container = styled(Form)`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const TitleStyled = styled(Title)`
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  img {
    width: 24px;
    margin-right: 0.5rem;
  }
`;

const CardStyled = styled(Card)`
  padding: 1rem;
`;

const Line = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  :not(:last-of-type) {
    margin-bottom: 0.5rem;
  }
`;

const Note = styled.div`
  max-width: 360px;
  position: absolute;
  bottom: 0;
  left: 0;
`;

const validationSchema = yup.object().shape({
  stakeAmount: yup
    .number()
    .typeError("Please enter a number")
    .required("Please enter stake amount")
    .moreThan(0, "Stake amount must be greater than 0")
    .test("amount test", function (stakeAmount) {
      try {
        utils.parseEther(stakeAmount!.toString());
        return true;
      } catch (e) {
        return this.createError({
          path: "stakeAmount",
          message: "Invalid stake amount",
        });
      }
    }),
});

interface FormikValues {
  stakeAmount: string;
}
const initialValues: FormikValues = {
  stakeAmount: "",
};

// const CONTRACT_ADDRESS = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84'; // Mainnet
const LIDO_ADDRESS = "0xbA453033d328bFdd7799a4643611b616D80ddd97"; // Rinkeby

const App: React.FC = () => {
  const { sdk } = useSafeAppsSDK();

  const handleSubmit = useCallback(
    async ({ stakeAmount }) => {
      try {
        const iface = new utils.Interface(ABI);
        const value = utils.parseEther(stakeAmount).toString();
        const data = iface.encodeFunctionData("submit", [
          constants.AddressZero,
        ]);
        const { safeTxHash } = await sdk.txs.send({
          txs: [
            {
              to: LIDO_ADDRESS,
              value,
              data,
            },
          ],
        });
        await sdk.txs.getBySafeTxHash(safeTxHash);
      } catch (_) {}
    },
    [sdk]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, setFieldValue, isValidating, isSubmitting }) => (
        <Container autoComplete="off">
          <TitleStyled size="md">
            Lido Ethereum Staking
            <img src={Logo} alt="Lido logo" />
          </TitleStyled>
          <Text size="lg">
            Stake your ETH with Lido and receive liquid stETH with daily
            rewards.
          </Text>
          <TextField
            name="stakeAmount"
            label="Stake amount"
            type="number"
            value={values.stakeAmount}
            onChange={(e) => setFieldValue("stakeAmount", e.target.value)}
            meta={{ error: errors.stakeAmount }}
          />
          <Button
            type="submit"
            size="lg"
            color="primary"
            variant="contained"
            disabled={isValidating || isSubmitting}
          >
            Submit
          </Button>
          <CardStyled>
            <Line>
              <Text size="lg" color="secondaryHover">
                You will receive
              </Text>
              <Text size="lg" color="primary">
                {values.stakeAmount || 0} stETH
              </Text>
            </Line>
            <Line>
              <Text size="lg" color="secondaryHover">
                Exchange rate
              </Text>
              <Text size="lg" color="primary">
                1 ETH = 1 stETH
              </Text>
            </Line>
          </CardStyled>
          <Note>
            <Text size="md" color="secondaryHover">
              Please note that it may take a couple of minutes for your stETH to
              appear in the Assets section after the transaction is approved by
              all signers and executed.
            </Text>
          </Note>
        </Container>
      )}
    </Formik>
  );
};

export default App;
