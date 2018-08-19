import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/icons/OpenInNew';
import Button from '@material-ui/core/Button';
import { Link } from "react-router-dom";
import classnames from 'classnames';

const styles = theme => ({
  link: {
    textDecoration: 'none'
  }
});

@withStyles(styles)
export default class ResultsTable extends React.Component {

 	render() {
  		let {classes, query, results} = this.props;
    	return (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First name</TableCell>
                <TableCell>Last name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {
              results.map(edge => (
                <TableRow component={({children, className, ...other}) => <Link {...other} className={classnames(className, classes.link)} to={`/${edge.node.id}`}>{children}</Link>} hover key={edge.node.id}>
                  <TableCell>{edge.node.first_name}</TableCell>
                  <TableCell>{edge.node.last_name}</TableCell>
                  <TableCell>{edge.node.class}</TableCell>
                  <TableCell>
                    <Button size="small" href={edge.node.url}>
                      {'View online'}
                      <Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            }
            </TableBody>
          </Table>
        </Paper>
    	);
  	}
}