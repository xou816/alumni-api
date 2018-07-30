import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import SearchField from './SearchField';

const styles = theme => ({
  root: {
    padding: `${5 * theme.spacing.unit}px 25%`,
    background: theme.palette.grey[100],
    height: '100%',
    minHeight: '100vh'
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
  }
});

@withStyles(styles)
export default class SearchBar extends React.Component {

	state = {
		query: {}
	}

  onClick = event => this.props.onSearch(this.state.query)

	onSearchChanged = search => {
		let newQuery = search.reduce((acc, {name, value}) => ({
			...acc, 
			[name]: value
		}), {})
		this.setState({query: newQuery})
	}

 	render() {
  		let {classes} = this.props;
  		let {query} = this.state;
    	return (
	    	<Paper className={classes.search} elevation={0}>
		    	<Typography className={classes.text} variant="headline" component="h3">
		          	Find alumni
		      </Typography>
	    		<SearchField onSearchChanged={this.onSearchChanged} />
	    		<div className={classes.buttonContainer}>
		    		<Button onClick={this.onClick} color="secondary" variant="extendedFab">
		        	<SearchIcon /> Search
		      	</Button>
	      	</div>
	    	</Paper>
      );
  	}
}