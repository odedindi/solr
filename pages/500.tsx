import {
	createStyles,
	Title,
	Text,
	Button,
	Container,
	Group,
} from '@mantine/core'

const useStyles = createStyles((theme) => {
	const isDark = theme.colorScheme === 'dark'
	return {
		root: {
			padding: '180px 80px',
			backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
		},

		label: {
			textAlign: 'center',
			fontWeight: 900,
			fontSize: 220,
			lineHeight: 1,
			marginBottom: theme.spacing.xl * 1.5,
			color: isDark
				? theme.colors[theme.primaryColor][3]
				: theme.colors[theme.primaryColor][7],

			[theme.fn.smallerThan('sm')]: {
				fontSize: 120,
			},
		},

		title: {
			fontFamily: `Greycliff CF, ${theme.fontFamily}`,
			textAlign: 'center',
			fontWeight: 900,
			fontSize: 38,
			color: isDark ? theme.white : theme.colors.dark[7],

			[theme.fn.smallerThan('sm')]: {
				fontSize: 32,
			},
		},

		description: {
			maxWidth: 540,
			margin: 'auto',
			marginTop: theme.spacing.xl,
			marginBottom: theme.spacing.xl * 1.5,
			color: isDark
				? theme.colors[theme.primaryColor][1]
				: theme.colors[theme.primaryColor][9],
		},
	}
})

export default function ServerError() {
	const { classes } = useStyles()

	const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		if (typeof window !== undefined) {
			let currentLocation = window.origin // get url of current page
			window.location.href = currentLocation
		}
	}

	return (
		<div className={classes.root}>
			<Container>
				<div className={classes.label}>500</div>
				<Title className={classes.title}>Something bad just happened...</Title>
				<Text size="lg" align="center" className={classes.description}>
					Our servers could not handle your request. Don&apos;t worry, our
					development team was already notified. Try refreshing the page.
				</Text>
				<Group position="center">
					<Button   size="md" onClick={onClick}>
						Refresh the page
					</Button>
				</Group>
			</Container>
		</div>
	)
}
