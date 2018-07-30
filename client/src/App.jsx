import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import SearchField from './components/SearchField';
import Results from './components/Results';
import CssBaseline from '@material-ui/core/CssBaseline';

const styles = theme => ({
  root: {
    padding: `${5 * theme.spacing.unit}px 25%`,
    background: theme.palette.grey[100],
    height: '100vh'
  },
  search: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: 0,
    marginBottom: theme.spacing.unit * 10,
    background: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  text: {
  	color: theme.palette.primary.contrastText,
  	paddingBottom: theme.spacing.unit
  },
  buttonContainer: {
  	textAlign: 'center',
  	position: 'relative',
  	bottom: theme.spacing.unit * -3
  },
  chip: {
  	marginRight: theme.spacing.unit
  }
});

@withStyles(styles)
export default class App extends React.Component {

 	render() {
  		let {classes} = this.props;
    	return (<React.Fragment><CssBaseline /><div className={classes.root}>
	    	<Paper className={classes.search} elevation={0}>
		    	<Typography className={classes.text} variant="headline" component="h3">
		          	Find alumni
		        </Typography>
	    		<SearchField />
	    		<div className={classes.buttonContainer}>
		    		<Button color="secondary" variant="extendedFab" className={classes.button}>
		        		<SearchIcon /> Search
		      		</Button>
	      		</div>
	    	</Paper>
	    	<Results />
    	</div></React.Fragment>);
  	}
}