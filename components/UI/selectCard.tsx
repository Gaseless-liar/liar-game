/* eslint-disable @next/next/no-img-element */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import React, { FunctionComponent } from "react";

type SelectCardProps = {
  cards: string[];
  card: string;
  changeCard: (e: any) => void;
};

const SelectCard: FunctionComponent<SelectCardProps> = ({
  cards,
  card,
  changeCard,
}) => {
  return (
    <div className="mt-3">
      <FormControl fullWidth>
        <InputLabel>Starknet.id</InputLabel>
        <Select
          value={card}
          defaultValue={cards[0]}
          label="Cards"
          onChange={changeCard}
          sx={{
            "& .MuiSelect-select": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        >
          <MenuItem value={0}>
            <ListItemIcon>
              <img
                width={"25px"}
                src="/visuals/StarknetIdLogo.png"
                alt="starknet.id avatar"
              />
            </ListItemIcon>
            <ListItemText primary="Mint a new starknet.id" />
          </MenuItem>
          {cards.map((card, index) => (
            <MenuItem key={index} value={card}>
              <ListItemIcon>
                <img
                  width={"25px"}
                  src={`https://www.starknet.id/api/identicons/${card}`}
                  alt="starknet.id avatar"
                />
              </ListItemIcon>
              <ListItemText primary={card} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Choose the starknet identity you want to link with your domain
        </FormHelperText>
      </FormControl>
    </div>
  );
};

export default SelectCard;
