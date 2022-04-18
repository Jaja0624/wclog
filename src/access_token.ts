// import axios from 'axios'
// import * as wclog_client from './keys.json'
// import fs from 'fs'

// const access_token_path = './access_token'

// const get_access_token = async () => {
//     const res = await axios({
//       method: 'post',
//       url: wclog_client.token_uri,
//       auth: {
//         username: wclog_client.client_id,
//         password: wclog_client.client_secret
//       },
//       data: {
//         grant_type: 'client_credentials'
//       }
//     })
//     fs.writeFileSync(access_token_path, res.data.access_token)
//     return res.data.access_token
// }


// console.log(get_access_token().then((val) => console.log(val)))

import axios from 'axios'

export async function getRateLimit(access_token: string) {
	try {
		const response = await axios({
			url: 'https://www.warcraftlogs.com/api/v2/client',
			headers: {'Authorization': `Bearer ${access_token}`},
			method: 'post',
			data: {
			  query: `
				  {
					rateLimitData {
						limitPerHour
						pointsSpentThisHour
						pointsResetIn
					}
				}
				`
			}
		  })
		return response 
	} catch (err: any) {
		return err
	}
}


export async function getCharacterDataAll(access_token: string, user: Record<string, any>) {
	const diff: number[] = [3,4,5]
	const metric: string[] = ['dps', 'hps']
	let output: Record<string, any> = {
		user: user,
		data: {
			"dps": {
				3: [null,null,null],
				4: [null,null,null],
				5: [null,null,null]
			},
			"hps": {
				3: [null,null,null],
				4: [null,null,null],
				5: [null,null,null]
			}
		}
	}

	// get BPA
	for (const d of diff) { 
		for (const m of metric) { 
			const response = await getCharacterData(access_token, {diff: d, metric: m, ...user})
			if (response.data.errors) {
				return response.data
			} else {
				const bpa = response.data.data['characterData']['character']['zoneRankings']['bestPerformanceAverage']
				const rankings = response.data.data['characterData']['character']['zoneRankings']['rankings']
				let min = 999
				let max = 0
				for (const encounterRanking of rankings) {
					if (encounterRanking['rankPercent'] == null) continue
					if (encounterRanking['rankPercent'] > max) max = encounterRanking['rankPercent']
					if (encounterRanking['rankPercent'] < min) min = encounterRanking['rankPercent']
				}
				output.data[m][d][0] = min == 999 ? null : min
				output.data[m][d][1] = bpa
				output.data[m][d][2] = max
			}
		}
	}
	return output
}

// {
// 	"data": {
// 		"characterData": {
// 			"character": {
// 				"id": 64513039,
// 				"zoneRankings": {
// 					"bestPerformanceAverage": 83.01223360309024,
// 					"medianPerformanceAverage": 64.98776783529725,
// 					"difficulty": 4,
// 					"metric": "hps",
// 					"partition": 1,
// 					"zone": 29,
// 					"allStars": [
// 						{
// 							"partition": 1,
// 							"spec": "Holy",
// 							"points": 910.852,
// 							"possiblePoints": 1320,
// 							"rank": 1326,
// 							"regionRank": 317,
// 							"serverRank": 53,
// 							"rankPercent": 93.37897261643015,
// 							"total": 20012
// 						},
// 						{
// 							"partition": 1,
// 							"spec": "Retribution",
// 							"points": 111.579,
// 							"possiblePoints": 1320,
// 							"rank": 9564,
// 							"regionRank": 3145,
// 							"serverRank": 292,
// 							"rankPercent": 35.8317117358921,
// 							"total": 14903
// 						},
// 						{
// 							"partition": 1,
// 							"spec": "Protection",
// 							"points": 37.5172,
// 							"possiblePoints": 1320,
// 							"rank": 14295,
// 							"regionRank": 4594,
// 							"serverRank": 505,
// 							"rankPercent": 10.10062893081761,
// 							"total": 15900
// 						}
// 					],
// 					"rankings": [
// 						{
// 							"encounter": {
// 								"id": 2512,
// 								"name": "Vigilant Guardian"
// 							},
// 							"rankPercent": 92.738495001137,
// 							"medianPercent": 67.166394916498,
// 							"lockedIn": true,
// 							"totalKills": 6,
// 							"fastestKill": 357108,
// 							"allStars": {
// 								"points": 103.43,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 1518,
// 								"regionRank": 453,
// 								"serverRank": 54,
// 								"rankPercent": 90.50212872526922,
// 								"total": 15972
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 10660.802894362
// 						},
// 						{
// 							"encounter": {
// 								"id": 2540,
// 								"name": "Dausegne, the Fallen Oracle"
// 							},
// 							"rankPercent": 98.873461930033,
// 							"medianPercent": 78.352147476407,
// 							"lockedIn": true,
// 							"totalKills": 6,
// 							"fastestKill": 173691,
// 							"allStars": {
// 								"points": 113.74,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 156,
// 								"regionRank": 43,
// 								"serverRank": 7,
// 								"rankPercent": 98.86505088965366,
// 								"total": 13657
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 12677.680478551
// 						},
// 						{
// 							"encounter": {
// 								"id": 2553,
// 								"name": "Artificer Xy'mox"
// 							},
// 							"rankPercent": 70.875585414105,
// 							"medianPercent": 59.251597083259,
// 							"lockedIn": true,
// 							"totalKills": 6,
// 							"fastestKill": 270697,
// 							"allStars": {
// 								"points": 74.53,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 4496,
// 								"regionRank": 1134,
// 								"serverRank": 145,
// 								"rankPercent": 63.01629093302616,
// 								"total": 12154
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 10474.242937812
// 						},
// 						{
// 							"encounter": {
// 								"id": 2544,
// 								"name": "Prototype Pantheon"
// 							},
// 							"rankPercent": 93.04802282899543,
// 							"medianPercent": 93.04802282899543,
// 							"lockedIn": false,
// 							"totalKills": 5,
// 							"fastestKill": 297484,
// 							"allStars": {
// 								"points": 98.7397737892184,
// 								"possiblePoints": 120,
// 								"partition": 0,
// 								"rank": "-",
// 								"regionRank": "-",
// 								"rankPercent": "-",
// 								"total": 0
// 							},
// 							"spec": "Retribution",
// 							"bestSpec": "Retribution",
// 							"bestAmount": 1070.2029257228
// 						},
// 						{
// 							"encounter": {
// 								"id": 2542,
// 								"name": "Skolex, the Insatiable Ravener"
// 							},
// 							"rankPercent": 90.460410105652,
// 							"medianPercent": 71.175207081776,
// 							"lockedIn": true,
// 							"totalKills": 6,
// 							"fastestKill": 204230,
// 							"allStars": {
// 								"points": 97.83,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 1843,
// 								"regionRank": 477,
// 								"serverRank": 67,
// 								"rankPercent": 87.21987094983696,
// 								"total": 14413
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 11588.380747197
// 						},
// 						{
// 							"encounter": {
// 								"id": 2529,
// 								"name": "Halondrus the Reclaimer"
// 							},
// 							"rankPercent": 79.403594822281,
// 							"medianPercent": 23.036015765448,
// 							"lockedIn": true,
// 							"totalKills": 5,
// 							"fastestKill": 312125,
// 							"allStars": {
// 								"points": 86.46,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 2902,
// 								"regionRank": 677,
// 								"serverRank": 96,
// 								"rankPercent": 74.46077999823927,
// 								"total": 11359
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 9758.1866239487
// 						},
// 						{
// 							"encounter": {
// 								"id": 2539,
// 								"name": "Lihuvim, Principal Architect"
// 							},
// 							"rankPercent": 99.775008962865,
// 							"medianPercent": 99.286380064382,
// 							"lockedIn": true,
// 							"totalKills": 6,
// 							"fastestKill": 298127,
// 							"allStars": {
// 								"points": 111.58,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 32,
// 								"regionRank": 10,
// 								"serverRank": 1,
// 								"rankPercent": 99.6252417794971,
// 								"total": 8272
// 							},
// 							"spec": "Retribution",
// 							"bestSpec": "Retribution",
// 							"bestAmount": 1141.5638301798
// 						},
// 						{
// 							"encounter": {
// 								"id": 2546,
// 								"name": "Anduin Wrynn"
// 							},
// 							"rankPercent": 86.472218741488,
// 							"medianPercent": 81.433852602821,
// 							"lockedIn": true,
// 							"totalKills": 3,
// 							"fastestKill": 503115,
// 							"allStars": {
// 								"points": 100.66,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 1155,
// 								"regionRank": 214,
// 								"serverRank": 28,
// 								"rankPercent": 86.39150943396227,
// 								"total": 8480
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 13042.466678585
// 						},
// 						{
// 							"encounter": {
// 								"id": 2543,
// 								"name": "Lords of Dread"
// 							},
// 							"rankPercent": 37.93388005866,
// 							"medianPercent": 28.562751624543,
// 							"lockedIn": true,
// 							"totalKills": 3,
// 							"fastestKill": 383640,
// 							"allStars": {
// 								"points": 70.66,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 4193,
// 								"regionRank": 818,
// 								"serverRank": 132,
// 								"rankPercent": 39.89964157706093,
// 								"total": 6975
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 10962.168009284
// 						},
// 						{
// 							"encounter": {
// 								"id": 2549,
// 								"name": "Rygelon"
// 							},
// 							"rankPercent": 80.541658165686,
// 							"medianPercent": 48.565308908843,
// 							"lockedIn": true,
// 							"totalKills": 3,
// 							"fastestKill": 318551,
// 							"allStars": {
// 								"points": 90.07,
// 								"possiblePoints": 120,
// 								"partition": 1,
// 								"rank": 1463,
// 								"regionRank": 303,
// 								"serverRank": 52,
// 								"rankPercent": 76.29701686121919,
// 								"total": 6168
// 							},
// 							"spec": "Holy",
// 							"bestSpec": "Holy",
// 							"bestAmount": 15536.513776444
// 						},
// 						{
// 							"encounter": {
// 								"id": 2537,
// 								"name": "The Jailer"
// 							},
// 							"rankPercent": null,
// 							"medianPercent": null,
// 							"allStars": null,
// 							"lockedIn": true,
// 							"totalKills": 0,
// 							"fastestKill": 0,
// 							"bestAmount": 0,
// 							"spec": null
// 						}
// 					]
// 				}
// 			}
// 		}
// 	}
// }

// 'user': {
// 	'bpa': {
// 		'dps': {
// 			'n': 50,
// 			'h': 50,
// 			'm': 50
// 		},
// 		'hps': {
// 			'n': 50,
// 			'h': 50,
// 			'm': 50
// 		}
// 	}
// }

export async function getCharacterData(access_token: string, variables: Record<string, any>) {
    const response = await axios({
        url: 'https://www.warcraftlogs.com/api/v2/client',
        headers: {'Authorization': `Bearer ${access_token}`},
        method: 'post',
        data: {
            query: `
			query($name: String!, $server: String!, $region: String!, $diff: Int!, $metric: CharacterRankingMetricType!) {
				characterData {
					character(name: $name, serverSlug: $server, serverRegion: $region) {
						id
						zoneRankings(byBracket: true, difficulty: $diff, metric: $metric)
					}
				}
			}
            `,
			variables
        }
      })

      return response
}
