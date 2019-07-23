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
    async emailSignin(email: string, password: string){
      const provider = new auth.EmailAuthProvider();
      const credential = await this.afAuth.auth.signInWithEmailAndPassword(email, password).then(value => {
        console.log('Nice, it worked!');
      })
      .catch(err => {
        alert(err.message);
        console.log('Something went wrong:', err.message);
      });
    }
    emailSignup(email: string, password: string) {
      this.afAuth
        .auth
        .createUserWithEmailAndPassword(email, password)
        .then(value => {
          alert('Success!');
          console.log('Success!', value);
        })
        .catch(err => {
          console.log('Something went wrong:', err.message);
        });
    }
    forgotPassword(email: string){
      this.afAuth.auth.sendPasswordResetEmail(email).then(() => console.log("email sent"))
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
