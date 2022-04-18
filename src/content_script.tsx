import { getCharacterDataAll } from './access_token'

console.log("HAHAHA")
function getCharacter() {
	console.log("?")
	const nameXPATH = '//div[contains(@class, "rio-characterbanner")]//h3[contains(@class, "slds")]/span'
	const regionXPATH = '//div[contains(@class, "rio-characterbanner")]//h3[contains(@class, "slds-text-body")]/span' // remove whitespace, brackets
	const serverXPATH = '//div[contains(@class, "rio-characterbanner")]//h3[contains(@class, "slds-text-body")]/span[2]' // remove whitespace
	let name_el = document.evaluate(nameXPATH, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
	let region_el = document.evaluate(regionXPATH, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
	let server_el = document.evaluate(serverXPATH, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue

	if (name_el && region_el && server_el) {
		const dude = {
			name: name_el.textContent,
			region: region_el.textContent?.replace('(', '').replace(')', '').trim(), 
			server: server_el.textContent?.replace(/ /g,'')
		}
		return dude
	} 

	return null
}

function getCharacterData(dude: any, callback: any) {
	console.log('getting character data', dude)
	chrome.storage.sync.get(['wclog_access_token'], async (result) => {
		const data = await getCharacterDataAll(result.wclog_access_token, dude)
		callback(data)
	})
}

function genId(characterData: any) {
	return `wclog-${characterData.name}-${characterData.region}-${characterData.server}`
}

function colourize(pNode: HTMLParagraphElement): HTMLParagraphElement {
	const colourz: Record<number, string> = {
		100: '#E5C166',
		99: '#E268A8',
		95: '#FF8000',
		80: '#9D35EE',
		50: '#00a1ff',
		30: '#1EFF00',
		0: '#999999'
	}
	for (const val in colourz) {
		if (parseInt(pNode.innerHTML!) >= parseInt(val)) {
			pNode.style.color = colourz[val]
		}	
	}
	return pNode
}

function injectNumbers(characterData: any) {
	console.log("injecting numbers", characterData)
	const dps = characterData['data']['dps']
	const hps = characterData['data']['hps']

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			dps[i+3][j] = Math.round(dps[i+3][j])
			hps[i+3][j] = Math.round(hps[i+3][j])
		}
	}

	const char_col = document.querySelector('h1[class="slds-col"]')
	let thediv = document.createElement('div')
	thediv.id = genId(characterData.user)
	thediv.style.padding = "0.4rem"
	thediv.style.minHeight = "100px"
	thediv.style.width = "200px"
	thediv.style.backgroundColor = "black"
	thediv.style.fontWeight = 'bold'
	thediv.style.fontSize = '1rem'

	let table = document.createElement('table')


	for (let i = 0 ; i < 4; i++) { // row
		const tr = table.insertRow()
		for (let j = 0; j < 3; j++) { // col
			const td = tr.insertCell()
			if (i==0 && j==0) {
				td.appendChild 
				continue
			}
			if (i == 0 && j == 1) {
				td.appendChild(document.createTextNode(`DPS`))
			} else if (i == 0 && j == 2) {
				td.appendChild(document.createTextNode(`HPS`))
			} else if (j == 0 && i == 1) {
				td.appendChild(document.createTextNode(`N`))
			} else if (j == 0 && i == 2) {
				td.appendChild(document.createTextNode(`H`))
			} else if (j == 0 && i == 3) {
				td.appendChild(document.createTextNode(`M`))
			} else {
				if (j == 1 && i > 0) {
					let lo: HTMLParagraphElement = document.createElement('p')
					lo.appendChild(document.createTextNode(`${dps[i+2][0]}`))
					lo = colourize(lo)
					let avg: HTMLParagraphElement = document.createElement('p')
					avg.appendChild(document.createTextNode(`${dps[i+2][1]}`))
					avg = colourize(avg)
					let hi: HTMLParagraphElement = document.createElement('p')
					hi.appendChild(document.createTextNode(`${dps[i+2][2]}`))
					hi = colourize(hi)


					let dav = document.createElement('div')
					dav.style.display = 'flex'
					dav.appendChild(lo)
					dav.appendChild(document.createTextNode(','))
					dav.appendChild(avg)
					dav.appendChild(document.createTextNode(','))
					dav.appendChild(hi)

					td.appendChild(dav)
				} else if (j == 2 && i > 0) {
					let lo: HTMLParagraphElement = document.createElement('p')
					lo.appendChild(document.createTextNode(`${hps[i+2][0]}`))
					lo = colourize(lo)
					let avg: HTMLParagraphElement = document.createElement('p')
					avg.appendChild(document.createTextNode(`${hps[i+2][1]}`))
					avg = colourize(avg)
					let hi: HTMLParagraphElement = document.createElement('p')
					hi.appendChild(document.createTextNode(`${hps[i+2][2]}`))
					hi = colourize(hi)

					let dav = document.createElement('div')
					dav.style.display = 'flex'
					dav.appendChild(lo)
					dav.appendChild(document.createTextNode(','))
					dav.appendChild(avg)
					dav.appendChild(document.createTextNode(','))
					dav.appendChild(hi)

					td.appendChild(dav)
					// td.appendChild(document.createTextNode(`${hps[i+2][0]}, ${hps[i+2][1]}, ${hps[i+2][2]}`))
				}
			}

		}
	}
	thediv.appendChild(table)
	char_col?.insertAdjacentElement('afterend', thediv)
}

let currentUser: any = getCharacter()
getCharacterData(currentUser, injectNumbers)
let observer = new MutationObserver(function(mutations) {
	// getCharacter()
	console.log("MUT")
	const newUser: any = getCharacter()
	if (currentUser == null || (currentUser && currentUser.name != newUser.name))  {
		currentUser = newUser
		getCharacterData(currentUser, injectNumbers)
	}
	const charDataDivEl = document.querySelector(genId(currentUser))

})
observer.observe(document, {
	subtree: true,
	attributes: true,
	//...
});