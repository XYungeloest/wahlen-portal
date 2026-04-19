export function sainteLague(votes: Record<string, number>, totalSeats: number, threshold = 5) {
  const qualified = Object.entries(votes).filter(([, vote]) => vote >= threshold);
  const quotients: Array<{ party: string; value: number }> = [];

  for (const [party, vote] of qualified) {
    for (let i = 0; i < totalSeats * 3; i += 1) {
      quotients.push({ party, value: vote / (2 * i + 1) });
    }
  }

  quotients.sort((a, b) => b.value - a.value);

  const seats = Object.fromEntries(Object.keys(votes).map((party) => [party, 0]));
  for (let i = 0; i < totalSeats; i += 1) {
    seats[quotients[i].party] += 1;
  }

  return seats;
}
