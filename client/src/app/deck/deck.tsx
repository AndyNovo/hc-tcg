import classnames from 'classnames'
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT} from 'common/types/cards'
import {CardT} from 'common/types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import css from './deck.module.css'
import {getPlayerDeck} from 'logic/session/session-selectors'
import ImportExport from './import-export'

const TYPE_ORDER = {
	hermit: 0,
	effect: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

const sortCards = (cards: Array<CardT>): Array<CardT> => {
	return cards.slice().sort((a: CardT, b: CardT) => {
		const cardInfoA = CARDS[a.cardId]
		const cardInfoB = CARDS[b.cardId]
		if (cardInfoA.type !== cardInfoB.type) {
			return TYPE_ORDER[cardInfoA.type] - TYPE_ORDER[cardInfoB.type]
		} else if (
			cardInfoA.type === 'hermit' &&
			cardInfoB.type === 'hermit' &&
			cardInfoA.hermitType !== cardInfoB.hermitType
		) {
			return cardInfoA.hermitType.localeCompare(cardInfoB.hermitType)
		}
		return cardInfoA.name.localeCompare(cardInfoB.name)
	})
}

type Props = {
	setMenuSection: (section: string) => void
}
const Deck = ({setMenuSection}: Props) => {
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const [pickedCards, setPickedCards] = useState<CardT[]>(
		playerDeck.map((cardId) => ({
			cardId: cardId,
			cardInstance: Math.random().toString(),
		}))
	)

	const [deckName, setDeckName] = useState<string>('')
	const [showImportExport, setShowImportExport] = useState<boolean>(false)
	const [loadedDecks, setLoadedDecks] = useState<Array<string>>([])

	const loadSavedDecks = () => {
		const deckList: Array<string> = (Object.keys(localStorage) as any)
			.map((key: string) => {
				if (!key.startsWith('Loadout_')) return null
				const deckName = key?.replace(/Loadout_/g, '')
				return deckName
			})
			.filter(Boolean)
		setLoadedDecks(deckList.sort())
	}

	const commonCards = pickedCards.filter(
		(card) => CARDS[card.cardId].rarity === 'common'
	)
	const rareCards = pickedCards.filter(
		(card) => CARDS[card.cardId].rarity === 'rare'
	)
	const ultraRareCards = pickedCards.filter(
		(card) => CARDS[card.cardId].rarity === 'ultra_rare'
	)

	const validationMessage = validateDeck(pickedCards.map((card) => card.cardId))

	const addCard = (card: CardT) => {
		setPickedCards((pickedCards) => {
			return [
				...pickedCards,
				{cardId: card.cardId, cardInstance: Math.random().toString()},
			]
		})
	}
	const removeCard = (card: CardT) => {
		setPickedCards((pickedCards) =>
			pickedCards.filter(
				(pickedCard) => pickedCard.cardInstance !== card.cardInstance
			)
		)
	}
	const backToMenu = () => {
		dispatch({
			type: 'UPDATE_DECK',
			payload: pickedCards.map((card) => card.cardId),
		})
		setMenuSection('mainmenu')
	}

	const clearDeck = () => {
		setPickedCards([])
	}
	const saveDeck = () => {
		localStorage.setItem('Loadout_' + deckName, JSON.stringify(pickedCards))
		loadSavedDecks()
	}
	const loadDeck = () => {
		const deck = localStorage.getItem('Loadout_' + deckName)
		if (!deck) return
		const deckIds = JSON.parse(deck).filter((card: CardT) => CARDS[card.cardId])
		setPickedCards(deckIds)
	}
	const allCards = Object.values(CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)

	useEffect(() => loadSavedDecks(), [])

	const sortedAllCards = sortCards(allCards)
	const sortedDeckCards = sortCards(pickedCards)

	return (
		<div className={css.deck}>
			<div className={css.header}>
				<button disabled={!!validationMessage} onClick={backToMenu}>
					Back to menu
				</button>
				<div className={css.limits}>{validationMessage}</div>
				<div className={css.dynamicSpace} />
				<button onClick={clearDeck}>Clear</button>
				<div className={css.saveLoadDecks}>
					<input
						maxLength={25}
						name="deckName"
						placeholder="Deck Name..."
						onBlur={(e) => {
							setDeckName(e.target.value)
						}}
						list="deck-list"
					/>
					<datalist id="deck-list">
						{loadedDecks.map((deckName: string) => (
							<option key={deckName} value={deckName} />
						))}
					</datalist>
					<button type="button" onClick={saveDeck}>
						Save
					</button>
					<button type="button" onClick={loadDeck}>
						Load
					</button>
				</div>
				<button type="button" onClick={() => setShowImportExport(true)}>
					Import/Export
				</button>
			</div>
			<div className={css.cards}>
				<div className={classnames(css.cardColumn, css.allCards)}>
					<div className={css.cardsTitle}>All cards</div>
					<CardList
						cards={sortedAllCards}
						onClick={addCard}
						size="small"
						wrap={true}
					/>
				</div>
				<div className={classnames(css.cardColumn, css.selectedCards)}>
					<div className={css.cardsTitle}>
						<span>Your deck ({pickedCards.length})</span>
						<span> - </span>
						<span className={css.commonAmount} title="Common">
							{commonCards.length}
						</span>
						<span> </span>
						<span className={css.rareAmount} title="Rare">
							{rareCards.length}
						</span>
						<span> </span>
						<span className={css.ultraRareAmount} title="Ultra rare">
							{ultraRareCards.length}
						</span>
					</div>
					<CardList
						cards={sortedDeckCards}
						onClick={removeCard}
						size="small"
						wrap={true}
					/>
				</div>
			</div>
			{showImportExport ? (
				<ImportExport
					pickedCards={pickedCards}
					setPickedCards={setPickedCards}
					close={() => setShowImportExport(false)}
				/>
			) : null}
		</div>
	)
}

export default Deck
