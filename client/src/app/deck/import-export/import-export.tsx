import {useRef} from 'react'
import {CardT} from 'common/types/game-state'
import CARDS from 'server/cards'
import css from './import-export.module.css'
import {universe, randomdecks} from './import-export-const'
import Modal from 'components/modal'

type Props = {
	pickedCards: Array<CardT>
	setPickedCards: (pickedCards: Array<CardT>) => void
	close: () => void
}

const ImportExport = ({pickedCards, setPickedCards, close}: Props) => {
	const inputRef = useRef<HTMLInputElement | null>(null)

	const importDeck = () => {
		if (!inputRef.current) return
		const b64 = atob(inputRef.current.value)
			.split('')
			.map((char) => char.charCodeAt(0))
		const deck = []
		for (let i = 0; i < b64.length; i++) {
			deck.push({
				cardId: universe[b64[i]],
				cardInstance: Math.random().toString(),
			})
		}
		if (!deck) return
		const deckCards = deck.filter((card: CardT) => CARDS[card.cardId])
		setPickedCards(deckCards)
	}

	const randomDeck = () => {
		if (!inputRef.current) return
		const idx = Math.floor(Math.random() * randomdecks.length)
		inputRef.current.value = randomdecks[idx]
		importDeck()
	}

	const exportDeck = () => {
		if (!inputRef.current) return
		const indicies = []
		for (let i = 0; i < pickedCards.length; i++) {
			indicies.push(universe.indexOf(String(pickedCards[i].cardId)))
		}
		const b64cards = btoa(String.fromCharCode.apply(null, indicies))
		inputRef.current.value = b64cards
	}

	const urlParams = new URLSearchParams(document.location.search || '')
	if (urlParams.has('deck')) {
		setTimeout(() => {
			const b64cards = urlParams.get('deck') || ''
			window.history.replaceState({}, '', window.location.pathname)
			if (!inputRef.current) {
				console.log('should be set...')
			} else {
				inputRef.current.value = b64cards
				importDeck()
			}
		}, 500)
	}

	return (
		<Modal title="Import/Export" closeModal={close}>
			<div className={css.importExport}>
				<div className={css.ieInput}>
					<input placeholder="Deck hash..." ref={inputRef} />
				</div>
				<div className={css.ieButtons}>
					<button type="button" onClick={importDeck}>
						Import
					</button>
					<button type="button" onClick={exportDeck}>
						Export
					</button>
					<button type="button" onClick={randomDeck}>
						Random
					</button>
				</div>
			</div>
		</Modal>
	)
}

export default ImportExport
