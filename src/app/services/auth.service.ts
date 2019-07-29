import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { User } from './user.model'; // optional

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

    user$: Observable<User>;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router
    ) {
      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
            // Logged in
          if (user) {
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            // Logged out
            return of(null);
          }
        })
      );
     }
     async googleSignin() {
      const provider = new auth.GoogleAuthProvider();
      const credential = await this.afAuth.auth.signInWithPopup(provider);
      // console.log(credential.user);
      return this.updateUserData(credential);
    }
    async facebookSignin() {
      const provider = new auth.FacebookAuthProvider();
      const credential = await this.afAuth.auth.signInWithPopup(provider);
      return this.updateUserData(credential);
    }
    async emailSignin(email: string, password: string) {
      const provider = new auth.EmailAuthProvider();
      const credential = await this.afAuth.auth.signInWithEmailAndPassword(email, password).then(value => {
        console.log('a ok');
      })
      .catch(err => {
        alert(err.message);
        console.log('Something went wrong:', err.message);
      });
    }
    async emailSignup(name: string, email: string, password: string) {
      return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        this.afAuth.user.subscribe( x => {
          if (x) {
            x.sendEmailVerification()
            .then(() => {
              return this.setUserDoc(user.user, name);
              console.log('Email verification sent');
            })
            .catch(err => {
              console.log('Error: ', err);
            });
          }
        }); })
        .catch(err => {
          console.log('Error: ', err);
        });
    }

    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error);
      return Promise.reject(error.message || error);
   }
   private setUserDoc(user, name) {

    const userRef = this.afs.doc(`users/${user.uid}`);
    // const name = user.email.split('@', 2)[0];
    const data: User = {
      uid: user.uid,
      email: user.email || null,
      displayName: name
    };

    return userRef.set(data);

  }
    forgotPassword(email: string) {
      this.afAuth.auth.sendPasswordResetEmail(email).then(() => console.log('email sent'))
      .catch((error) => console.log(error));
    }
    private updateUserData(user) {
      // Sets user data to firestore on login
      const userId = user.user.uid;
      console.log(user.user.uid + user.user.email + user.user.displayName + user.user.photoURL);
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${userId}`);
      const data = {
        uid: user.user.uid,
        email: user.user.email,
        displayName: user.user.displayName,
        photoURL: user.user.photoURL
      };
      return userRef.set(data, { merge: true });
    }
    async signOut() {
      await this.afAuth.auth.signOut();
      this.router.navigate(['/']);
    }
}
