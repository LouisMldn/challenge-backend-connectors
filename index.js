const domain = "http://localhost:3000";
const axios = require('axios').default;
const qs = require('querystring');
const fs = require('fs');

let accountsArray = []
let transactionsArray = []

fetchRefreshToken()
    .then(refreshTokenData => {
		fetchAccessToken(refreshTokenData.refresh_token)
			.then(accessTokenData => {
				fetchAccounts(accessTokenData.access_token)
			})
			.catch(err => console.log(err))
    })
	.catch(err => console.log(err))


	

async function fetchRefreshToken() {
	const refreshTokenPromise = axios.post(domain + '/login', {
		user: "BankinUser",
		password: "12345678",
	}, {
		headers: {
			"Authorization": "Basic QmFua2luQ2xpZW50SWQ6c2VjcmV0",
			"Content-type": "application/json",
			"Accept": "application/json"
		}
	})
	  const refreshTokenData = refreshTokenPromise.then((refreshTokenResponse) => refreshTokenResponse.data)
	  return refreshTokenData
	  .catch(function (error) {
		console.log(error);
	  });
}

async function fetchAccessToken(refreshToken) {
	const accessTokenPromise = axios.post(domain + "/token", {
		grant_type: "refresh_token",
		refresh_token: refreshToken
	}, {
		headers: {
			"Authorization": "Basic QmFua2luQ2xpZW50SWQ6c2VjcmV0",
			"Content-type": "application/json",
			"Accept": "application/json"
		}
	})
	  const accessTokenData = accessTokenPromise.then((accessTokenResponse) => accessTokenResponse.data)
	  return accessTokenData
	  .catch(function (error) {
		console.log(error);
	  });
}

async function fetchAccounts(accessToken, accountsPage = null) {
	if(accountsPage == null) {
		accountsPage = "/accounts"
	}
	axios.get(domain + accountsPage, {
		headers: {
			"Authorization": "Bearer " + accessToken
		}
	})
	.then((accountsReponse) => {
		accountsReponse.data.account.forEach(account => {
			fetchedAccount = {
				"acc_number": account.acc_number,
				"amount": account.amount,
				transactions: []
			}
			accountsArray.push(fetchedAccount)
		});

		if(accountsReponse.data.link.next) {
			fetchAccounts(accessToken, accountsReponse.data.link.next)
		} else if(accountsReponse.data.link.next == null) {
			accountsArray.forEach(account => {
				fetchTransactions(accessToken, account)
			})
		}			
	})
	.catch(function (error) {
		console.log(error);
	});
}

async function fetchTransactions(accessToken, account, transactionsPage = null) {
	if(transactionsPage == null) {
		transactionsPage = "/accounts/" + account.acc_number + "/transactions"
	}
	axios.get(domain + transactionsPage, {
		headers: {
			"Authorization": "Bearer " + accessToken
		}
	})
	.then((transactionsResponse) => {
		transactionsResponse.data.transactions.forEach(transaction => {
			fetchedTransaction = {
				"label": transaction.label,
				"amount": transaction.amount,
				"currency": transaction.currency
			}			    

			account.transactions.push(fetchedTransaction)			
		})
		var json = JSON.stringify(account, null, 4)
		if(transactionsResponse.data.link.next) {
			fetchTransactions(accessToken, account, transactionsResponse.data.link.next)
		} else if (transactionsResponse.data.link.next == null ) {
			transactionsArray.push(account)
			console.log(json)
		}
	})
	.catch(function (error) {
		//console.log(error);
	});	
}
