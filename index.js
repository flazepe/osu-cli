const readline = require("readline");
const {get} = require("https");
const {apiKey} = require("./config.json");

const modes = {
	"standard": "0", "s": "0",
	"taiko": "1", "t": "1",
	"catch": "2", "c": "2",
	"mania": "3", "m": "3"
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) { return new Promise(resolve => rl.question(question, data => resolve(data))); }

(async () => {
	const name = await ask("Provide the player name:\n");
	
	const mode = await (async () => {
		let data = await ask("Provide the mode - standard (s), taiko (t), catch (c), or mania (m):\n");
		data = data.toLowerCase();
		
		if (!modes[data]) {
			console.log("Invalid mode. Using standard as default.");
			return "0";
		}
		
		return data;
	})();
	
	rl.close();
	console.log("Fetching user...");
	
	get(`https://osu.ppy.sh/api/get_user?k=${apiKey}&m=${modes[mode]}&u=${encodeURIComponent(name)}`, res => {
		let data = "";
		
		res.on("data", chunk => data += chunk);
		
		res.on("end", () => {
			let json = JSON.parse(data);
			if (!json[0]) return console.log("User not found.");
			json = json[0];
			
			console.log("\n" + [
				["Name", `${json.username} (#${parseInt(json.pp_rank).toLocaleString()})`],
				["ID", json.user_id],
				["Country", `${json.country} (#${parseInt(json.pp_country_rank).toLocaleString()})`],
				["Created", json.join_date],
				["Performance Points", `${Math.floor(json.pp_raw).toLocaleString()}pp`],
				["Level", Math.floor(json.level)],
				["Accuracy", `${parseFloat(json.accuracy).toFixed(2)}%`],
				
				["Play Count", json.playcount ? parseInt(json.playcount).toLocaleString() : 0]
			].map(x => `${x[0]}: ${x[1]}`).join("\n"));
		});
	});
})();