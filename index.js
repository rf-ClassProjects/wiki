class Input {
  static keysPressed = {};
  static keysPressedPending = {};
  static lastKeyPressed = "";

  static init() {
    window.addEventListener("keydown", (event) => {
      if (event.key in Input.keysPressed) {
        return;
      }
      Input.keysPressed[event.key] = true;
      Input.keysPressedPending[event.key] = true;
      Input.lastKeyPressed = event.key;
    });

    window.addEventListener("keyup", (event) => {
      delete Input.keysPressed[event.key];
      // delete Input.keysPressedPending[event.key];
    });
  }

  static clearPendingInputs() {
    Input.keysPressedPending = {};
  }

  static getKey(key) {
    return Input.keysPressed[key];
  }

  static getKeyDown(...keys) {
    for (let key of keys) {
      if (key in Input.keysPressedPending) {
        delete Input.keysPressedPending[key];
        return key;
      }
    }
    return false;
  }

  static anyKeyDown() {
    return Object.keys(Input.keysPressedPending).length > 0;
  }

  static getKeyDicts() {
    return `Keys Pressed: ${JSON.stringify(Input.keysPressed)}\nKeys Pressed Pending: ${JSON.stringify(Input.keysPressedPending)}\nLast Key Pressed: ${Input.lastKeyPressed}`;
  }
}

function until(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 100);
  };
  return new Promise(poll);
}

function range(size, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

async function search(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.query.search;
  } catch (error) {
    console.error("An error occurred while searching Wikipedia:", error);
    return [];
  }
}

function menu(menuActions) {
  console.log("----------");
  menuActions.forEach(function (menuAction, idx) {
    console.log(`${idx}. ${menuAction}`);
  });
  console.log("----------");
  // validKeys = [];
  // range(menuActions.length).forEach((x) => validKeys.push(String(x)));
  // console.log(validKeys);
  while (true) {
    // await until((_) => (menuSelection = Input.getKeyDown(...validKeys)));
    menuSelection = prompt("Select a menu Item: ");
    try {
      menuSelection = Number(menuSelection);
      if (menuSelection >= 0 && menuSelection < menuActions.length) {
        return menuSelection;
      } else {
        console.log("Input is out of range of the menu");
      }
    } catch {
      console.log("Input must be a number");
    }
  }
}

savedData = {};

async function main() {
  Input.init();
  while (true) {
    selection = menu(["Make a new fetch request", "View all past queries"]);
    switch (selection) {
      case 0:
        let searchQuery = prompt("Enter your request: ");
        await search(searchQuery)
          .then(async (results) => {
            console.log("Search results:", results);
            // savingData = prompt("Would you like to save this query? (Y/N)").toUpperCase() == "Y";
            console.log("Would you like to save this query? (Y/N)");
            await until((_) => (savingData = Input.getKeyDown("y", "n")));

            savingData = savingData == "y";

            console.clear();
            if (savingData) {
              savedData[searchQuery] = results;
              console.log("Query Saved!");
            }
          })
          .catch((error) => {
            console.error("An error occurred:", error);
          });
        break;
      case 1:
        let validIdxs = [];
        let idx = 0;
        let currentRecord = null;

        console.clear();
        console.log("----------");
        for (const key in savedData) {
          console.log(`${idx}. ${key}`);
          validIdxs.push(String(idx));
          idx++;
        }
        console.log("----------");

        console.log("Input an index to view the record, or press ENTER to navigate back to the main menu...");

        Input.clearPendingInputs();
        await until((_) => (keyPressed = Input.getKeyDown("Enter", ...validIdxs)));
        if (keyPressed === "Enter") {
          continue;
        }

        currentRecord = Object.keys(savedData)[Number(keyPressed)];
        console.log(savedData[currentRecord]);

        console.log("Would you like to delete this record? (Y/N)");
        await until((_) => (keyPressed = Input.getKeyDown("y", "n")));

        let deleteRecord = keyPressed == "y";

        if (deleteRecord) {
          delete savedData[currentRecord];
        }

        console.clear();
        console.log("Deleted record: " + currentRecord);

      // await until((_) => Input.anyKeyDown());
      // for (let data of savedData) {
      //   console.log(data);
      // }
      // menu("View saved query data", "Delete saved query data");
    }
  }
}

main();
