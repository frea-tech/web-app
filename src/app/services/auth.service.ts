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
      return this.updateUserData(credential.user);
    }
    async facebookSignin() {
      const provider = new auth.FacebookAuthProvider();
      const credential = await this.afAuth.auth.signInWithPopup(provider);
      return this.updateUserData(credential.user);
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
    async emailSignup(email: string, password: string) {
      return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(user => {
        console.log(user);
        return this.setUserDoc(user.user); // create initial user document
      })
      .catch(error => this.handleError(error) );
    }
    private handleError(error: any): Promise<any> {
      console.error('An error occurred', error); // for demo purposes only
      return Promise.reject(error.message || error);
   }
   private setUserDoc(user) {

    const userRef = this.afs.doc(`users/${user.uid}`);
    const name = user.email.split('@', 2)[0];
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
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      const data = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      return userRef.set(data, { merge: true });
    }
    async signOut() {
      await this.afAuth.auth.signOut();
      this.router.navigate(['/']);
    }
}
