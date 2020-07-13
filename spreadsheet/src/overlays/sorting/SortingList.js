import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import Card from "./SortItem";
import update from "immutability-helper";
import { ItemTypes } from "./ItemTypes";

const SortingList = (props) => {
  const [cards, setCards] = useState([...props.sortsArray]);

  const moveCard = (id, atIndex) => {
    const { card, index } = findCard(id);
    setCards(
      update(cards, {
        $splice: [
          [index, 1],
          [atIndex, 0, card],
        ],
      })
    );
  };

  const findCard = (id) => {
    const card = cards.filter((c) => `${c.id}` === id)[0];
    return {
      card,
      index: cards.indexOf(card),
    };
  };

  const [, drop] = useDrop({ accept: ItemTypes.CARD });

  useEffect(() => {
    setCards(props.sortsArray);
  }, [props.sortsArray]);
  return (

    <React.Fragment>
      <div ref={drop} style={{ display: "flex", flexWrap: "wrap" }}>
        {cards.map((card) => (
          <Card
            key={card.id}
            id={`${card.id}`}
            text={card.text}
            moveCard={moveCard}
            findCard={findCard}
          />
        ))}
      </div>
    </React.Fragment>
  );
};

export default SortingList;
