export function removeCard(value: number, playerCards): void {
    playerCards.forEach((item, index, arr)) => {
        if (value == item) {
            arr.splice(index, 1)
            return;
        }
    });
}
