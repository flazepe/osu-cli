const readline = require("readline");
const { get } = require("https");
const API_KEY = require("./key.json");

const MODES = [
	{ name: "osu!", names: ["osu", "standard"], id: "0" },
	{ name: "osu!taiko", names: ["taiko"], id: "1" },
	{ name: "osu!catch", names: ["catch"], id: "2" },
	{ name: "osu!mania", names: ["mania"], id: "3" }
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(string, expectAnswer) {
	return expectAnswer
		? new Promise(resolve => rl.question(`\n${string}:\n`, resolve))
		: console.log(`\n${string}`);
}

async function start() {
	const name = await prompt("Enter a player's username", true);

	let mode = (
		await prompt(
			"Provide the mode - osu/standard (o/s), taiko (t), catch (c), or mania (m)",
			true
		)
	).toLowerCase();

	mode = MODES.find(_mode => _mode.names.some(_name => _name.startsWith(mode))) ?? MODES[0];

	prompt("Fetching user...");

	const [json] = await new Promise(resolve =>
		get(
			`https://osu.ppy.sh/api/get_user?k=${API_KEY}&m=${mode.id}&u=${encodeURIComponent(
				name
			)}`,
			res => {
				let data = "";
				res.on("data", chunk => (data += chunk));
				res.on("end", () => resolve(JSON.parse(data)));
			}
		)
	);

	if (!json) return prompt("User not found.");

	prompt(
		`${mode.name} statistics for ${json.username}\n\n` +
			[
				["Username", `${json.username} (#${parseInt(json.pp_rank).toLocaleString()})`],
				["ID", json.user_id],
				[
					"Country",
					`${json.country} (#${parseInt(json.pp_country_rank).toLocaleString()})`
				],
				["Created", json.join_date],
				["Performance Points", `${Math.floor(json.pp_raw).toLocaleString()}pp`],
				["Level", Math.floor(json.level)],
				["Accuracy", `${parseFloat(json.accuracy).toFixed(2)}%`],
				["Play Count", parseInt(json.playcount ?? 0).toLocaleString()]
			]
				.map(([_key, _value]) => `${_key}: ${_value}`)
				.join("\n")
	);

	return (await prompt("Want to search for another player? (y/n)", true))[0]?.toLowerCase() ===
		"y"
		? start()
		: process.exit();
}

start();
