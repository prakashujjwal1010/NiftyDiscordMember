import React from "react";
import { Button } from "antd";

// added display of 0 instead of NaN if gas price is not provided

/*
  ~ What it does? ~

  Displays gas gauge

  ~ How can I use? ~

  <GasGauge
    gasPrice={gasPrice}
  />

  ~ Features ~

  - Provide gasPrice={gasPrice} and get current gas gauge
*/

export default function GasGauge(props) {

  return (
    <Button
      onClick={() => {
        window.open("https://ethgasstation.info/");
      }}
      size="large"
      shape="round"
    >
      <span style={{ marginRight: 8 }}><span role="img" aria-label="fuelpump">⛽️</span></span>
      {typeof props.gasPrice == "undefined" ? "Get Gas" : parseInt(props.gasPrice, 10) / 10 ** 9}
    </Button>
  );
}
