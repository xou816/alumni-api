import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/icons/OpenInNew';
import Button from '@material-ui/core/Button';
import { Link } from "react-router-dom";
import classnames from 'classnames';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import pretty from '../sources';

const styles = theme => ({
  link: {
    textDecoration: 'none'
  }
});

@withStyles(styles)
export default class ResultsTable extends React.Component {

 	render() {
  		let {classes, query, results} = this.props;
    	return results.length ? (
        <Paper>
          <List>
          {
            results.map(edge => (
              <ListItem 
                button
                component={({children, className, ...other}) => <Link {...other} className={classnames(className, classes.link)} to={`/${edge.node.id}`}>{children}</Link>}  
                key={edge.node.id}>
                <Avatar>{(edge.node.class || '??').toString().substring(2)}'</Avatar>
                <ListItemText primary={edge.node.first_name + ' ' + edge.node.last_name} secondary={`Source: ${pretty[edge.node.source]}`} />
                <ListItemSecondaryAction><IconButton href={edge.node.url} target="_blank"><Icon /></IconButton></ListItemSecondaryAction>
              </ListItem>
            ))
          }
          </List>
        </Paper>
    	) : <div>No result</div>;
  	}
}