export const applyFormula = (obj, columnName) => {
  let item = obj[columnName].toString();
  if (item && item.charAt(0) === "=") {
    var operation = item.split("(");
    var value = operation[1]
      .substring(0, operation[1].length - 1)
      .split(/[,:]/);
    switch (operation[0]) {
      case "=SUM":
      case "=ADD":
      case "=sum":
      case "=add":
        obj[columnName] = value.reduce(function (a, b) {
          return Number(a) + Number(b);
        });
        break;
      case "=MUL":
      case "=mul":
        obj[columnName] = value.reduce(function (a, b) {
          return Number(a) * Number(b);
        });
        break;
      case "=SUB":
      case "=sub":
      case "=DIFF":
      case "=diff":
        obj[columnName] = value.reduce(function (a, b) {
          return Number(a) - Number(b);
        });
        break;
      case "=min":
      case "=MIN":
        obj[columnName] = Math.min.apply(Math, value);
        break;
      case "=max":
      case "=MAX":
        obj[columnName] = Math.max.apply(Math, value);
        break;
      default:
        console.log("No Calculation");
    }
  }
  return obj;
};