export const daysOff = [
  {
    name: "Days Off",
    id: "off",
    children: [
      {
        name: "Monday",
        id: 1
      },
      {
        name: "Tuesday",
        id: 2
      },
      {
        name: "Wednesday",
        id: 3
      },
      {
        name: "Thursday",
        id: 4
      },
      {
        name: "Friday",
        id: 5
      },
      {
        name: "Saturday",
        id: 6
      },
      {
        name: "Sunday",
        id: 0
      }
    ]
  }
];

export const convertNumberToTime = num => {
  try {
    const hours = Math.floor(num);
    let minutes = (num - hours) * 60;
    minutes = minutes
      .toString()
      .split(".")[0]
      .padStart(2, "0");
    if (!hours || !minutes) {
      throw new Error("Cannot convert number to time.");
    }
    return hours + ":" + minutes;
  } catch (err) {
    return "Click Me";
  }
};

export const convertTimeToNumber = (hour, minutes) => {
  const number = hour + minutes / 60;
  return number;
};
