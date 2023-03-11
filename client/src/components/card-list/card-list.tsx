import classnames from 'classnames'
import {useTransition, animated} from '@react-spring/web'
import {useRef} from 'react'
import CARDS from 'server/cards'
import {CardT} from 'common/types/game-state'
import Card from 'components/card'
import css from './card-list.module.scss'
import {equalCard} from 'server/utils'

const SIZE = {
	medium: 200,
	small: 120,
}

type CardListProps = {
	cards: Array<CardT>
	disabled?: Array<string>
	selected?: CardT | null
	picked?: Array<CardT>
	onClick?: (card: CardT) => void
	size: 'medium' | 'small'
	wrap?: boolean
}

const CardList = (props: CardListProps) => {
	const {wrap, onClick, size = 'medium'} = props
	const {cards, disabled, selected, picked} = props
	const listRef = useRef<HTMLDivElement>(null)

	const transitions = useTransition(cards, {
		config: {duration: 200},
		key: (card: CardT) => card.cardInstance,
		from: {
			width: listRef.current ? 0 : SIZE[size],
			height: listRef.current ? 0 : SIZE[size],
		},
		enter: {width: SIZE[size], height: SIZE[size]},
		leave: {width: 0, height: 0},
	})

	const cardsOutput = transitions((style: any, card: CardT) => {
		const info = CARDS[card.cardId]
		const costClass = `cost${__CARD_COSTS__[card.cardId]}`
		if (!info) return null
		const isSelected = equalCard(card, selected)
		const isPicked = !!picked?.find((pickedCard) => equalCard(card, pickedCard))
		const isDisabled = !!disabled?.find((id) => card.cardId === id)
		return (
			<animated.div
				style={style}
				key={card.cardInstance}
				className={classnames(
					css.card,
					{[css.clickable]: !!onClick},
					css[costClass]
				)}
			>
				<Card
					onClick={onClick && !isDisabled ? () => onClick(card) : undefined}
					card={info}
					selected={isSelected}
					picked={isPicked}
				/>
			</animated.div>
		)
	})

	return (
		<div
			ref={listRef}
			className={classnames(
				css.cardList,
				css[size],
				wrap === false ? css.noWrap : null
			)}
		>
			{cardsOutput}
		</div>
	)
}

export default CardList
