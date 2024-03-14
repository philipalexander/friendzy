import {Box, Button, TextField, ButtonGroup, Inline, Icon, Link } from "@stripe/ui-extension-sdk/ui";
import { useState } from "react";
import { showToast } from "@stripe/ui-extension-sdk/utils";
import { IReward } from "../views/CreateIncentive";


const Footer = () => {


  return (
    <Box css={{ height: "fill", stack: "y", distribute: "space-between" }}>
      <Box></Box>

      <Box css={{ color: "secondary" }}>
        <Box css={{ marginBottom: "medium" }}>
          
          <Link
            href="#"
            target="blank"
            type="secondary"
          >
            Read our FAQ
          </Link>
          .
        </Box>

        <Box css={{ marginBottom: "medium" }}>
          Questions? Get help from the Friendzy team{" "}
          <Link
            href="#"
            target="blank"
            type="secondary"
          >
            in our help center
          </Link>
          .
        </Box>
      </Box>
    </Box>
)};

export default Footer;
