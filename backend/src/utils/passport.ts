import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import User, { type IUser } from "../models/userModel.js";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL!;

// Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || "Google User";
        const providerId = profile.id;

        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        let user = await User.findOne({ email });

        if (user) {
          if (!user.ssoProvider || !user.ssoId) {
            user.ssoProvider = "google";
            user.ssoId = providerId;
            await user.save();
          }
        } else {
          user = await User.create({
            name,
            email,
            password: "",
            ssoProvider: "google",
            ssoId: providerId,
          });
        }

        done(null, user as IUser & { _id: string });
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  )
);

// GitHub strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: { emails?: { value: string }[]; username?: string; displayName?: string; id: string },
      done: (err: Error | null, user?: IUser & { _id: string }) => void
    ) => {
      try {
        const emailFromProfile = profile.emails?.[0]?.value;
        const fallbackEmail = profile.username ? `${profile.username}@users.noreply.github.com` : undefined;
        const email = emailFromProfile || fallbackEmail;
        const name = profile.displayName || profile.username || "GitHub User";
        const providerId = profile.id;

        if (!email) {
          return done(new Error("No email found in GitHub profile"), undefined);
        }

        let user = await User.findOne({ email });

        if (user) {
          if (!user.ssoProvider || !user.ssoId) {
            user.ssoProvider = "github";
            user.ssoId = providerId;
            await user.save();
          }
        } else {
          user = await User.create({
            name,
            email,
            password: "",
            ssoProvider: "github",
            ssoId: providerId,
          });
        }

        done(null, user as IUser & { _id: string });
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  )
);

// Serialize / deserialize
passport.serializeUser((user: any, done) => {
  done(null, user?._id?.toString() || undefined);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user as (IUser & { _id: string }) | undefined);
  } catch (err) {
    done(err as Error, undefined);
  }
});

export default passport;