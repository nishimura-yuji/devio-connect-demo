import { Component, OnInit } from '@angular/core';
import { AwsSdkService } from 'src/app/services/aws-sdk.service';

export interface User {
  id: Id;
  name: Name;
  age: Age;
}

interface Id {
  S: string;
}

interface Name {
  S: string;
}

interface Age {
  N: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  dynamodb: AWS.DynamoDB = null;
  users: User[] = [];
  constructor(private aws: AwsSdkService) {}

  ngOnInit() {
    const dynamodb = this.aws.dynamodb$.subscribe((data) => {
      if (!data) {
        return;
      }
      this.dynamodb = data;
      this.getUsers();
    });
  }
  getUsers() {
    const params = {
      TableName: 'user',
    };
    this.dynamodb.scan(params, (err, data) => {
      if (err) {
        console.log('Error', err);
      } else {
        console.log('Success', data.Items);
        this.users = (data.Items as any) as User[];
      }
    });
  }

}
