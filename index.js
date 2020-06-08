const readline = require("readline");
const fetch = require("node-fetch");

const { apiKey } = require("./config.json");
const modes = { "standard": "0", "taiko": "1", "catch": "2", "mania": "3" };

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
	return new Promise(resolve => rl.question(question, data => resolve(data)));
}

(async () => {
	const name = await ask("Provide the player name:\n");
	
	const mode = await (async () => {
		let data = await ask("Provide the mode (standard, taiko catch, or mania):\n");
		data = data.toLowerCase();
		
		if (!modes[data]) {
			console.log("Invalid mode. Using standard as default.");
			return "0";
		}
		
		return data;
	})();
	
	rl.close();
	
	console.log("Fetching user...");
	const res = await fetch(`https://osu.ppy.sh/api/get_user?k=${apiKey}&m=${modes[mode]}&u=${encodeURIComponent(name)}`)
	
	let json = await res.json();
	if (!json[0]) return console.log("User not found.");
	json = json[0];
	
	console.log("\n\n" + [
		["Name", `${json.username} (#${parseInt(json.pp_rank).toLocaleString()})`],
		["ID", json.user_id],
		["Country", `${json.country} (#${parseInt(json.pp_country_rank).toLocaleString()})`],
		["Created", json.join_date],
		["Performance Points", `${Math.floor(json.pp_raw).toLocaleString()}pp`],
		["Level", Math.floor(json.level)],
		["Accuracy", `${parseFloat(json.accuracy).toFixed(2)}%`],
		
		["Play Count", json.playcount ? parseInt(json.playcount).toLocaleString() : 0]
	].map(x => `${x[0]}: ${x[1]}`).join("\n"));
})();