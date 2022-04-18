import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { getRateLimit, getCharacterData } from "./access_token";
const Popup = () => {
	const [isExpired, setIsExpired] = useState<boolean>(false)
	const [accessToken, setAccessToken] = useState<string>('')
	const [rateLimit, setRateLimit] = useState<any>(null)

	useEffect(() => {
		if (accessToken) {
			get()
		}
	}, [accessToken]);

	async function get() {
		const res = await getRateLimit(accessToken)
		if (res && res.data) {
			console.log(res.data)
			setRateLimit(res.data.data.rateLimitData)
			chrome.storage.sync.set({wclog_access_token: accessToken}, () => {
				console.log('wclog_access_token set to ' + accessToken)
			})
		} else {
			setRateLimit(null)
			console.log(res)
		}
	}

	useEffect(() => {
		console.log("yeet")
		chrome.storage.sync.get(['wclog_access_token'], (result) => {
			setAccessToken(result.wclog_access_token)
			console.log("got", result.wclog_access_token)
		})
	}, []);

	function accessTokenDetails() {
		if (!rateLimit) return <></>
		return (
			<>
				<p>limitPerHour: {rateLimit?.limitPerHour}</p>
				<p>pointsSpentThisHour: {rateLimit?.pointsSpentThisHour}</p>
				<p>pointsResetIn: {rateLimit?.pointsResetIn}</p>
			</>
		)
	}

	return (
		<>
			<form>
				<label>
					Access token
					<input type='text' id='accesstoken' value={accessToken} onChange={(ev) => setAccessToken(ev.target.value)}/>
					{rateLimit && accessToken.length ? accessTokenDetails() : <p> not working</p>}
				</label>
			</form>
		</>
	);
};

ReactDOM.render(
	<React.StrictMode>
		<Popup />
	</React.StrictMode>,
	document.getElementById("root")
);
