


export function RestApi( phase ) {
	
	//Ha localban vagyunk, ne legyen API hívás
	if (window.location.hostname === 'localhost' || window.location.port === '5173') {
			console.log('Localhost környezet észlelve - API hívás kihagyva')
		return
	}

	
	let url

    switch (phase) {
        case 'WarpExit':
            url = "https://labor24.hu/space/api.php?action=WarpExit"
            break
        case 'Landing':
            url = "https://labor24.hu/space/api.php?action=Landing"
            break
        case 'Hit':
            url = "https://labor24.hu/space/api.php?action=Hit"
            break
        default:
            console.log('Ismeretlen phase:', phase)
            return // Kilép, ha nincs megfelelő phase
    }
    
	
	const sendRequest = async () => {
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			})
			
			if (response.ok) {
				console.log('Email sent successfully')
				if (onComplete) onComplete(true)
			} else {
				console.log('Failed to send email')
				if (onComplete) onComplete(false)
			}
		} catch (error) {
			console.log('Error sending email:', error)
			if (onComplete) onComplete(false)
		}
	}
	
	sendRequest()
	
}


