import {useRef} from 'react'
import {CardT} from 'common/types/game-state'
import css from './import-export.module.css'
import {randomdecks} from './import-export-const'
import {getDeckFromHash, getHashFromDeck} from './import-export-utils'
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
		setPickedCards(getDeckFromHash(inputRef.current.value))
	}

	const randomDeck = () => {
		if (!inputRef.current) return
		const idx = Math.floor(Math.random() * randomdecks.length)
		inputRef.current.value = randomdecks[idx]
		importDeck()
	}

	const exportDeck = () => {
		if (!inputRef.current) return
		inputRef.current.value = getHashFromDeck(pickedCards)
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
