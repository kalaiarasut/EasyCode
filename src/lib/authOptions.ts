import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                isAutoLogin: { label: "AutoLogin", type: "text" },
                userId: { label: "UserId", type: "text" }
            },
            async authorize(credentials: any): Promise<any> {
                // Auto-login flow for verified email links
                if (credentials?.isAutoLogin === "true" && (credentials?.email || credentials?.userId)) {
                    try {
                        let query = supabase.from('users').select('*');
                        if (credentials.userId) {
                            query = query.eq('id', credentials.userId);
                        } else {
                            query = query.eq('email', credentials.email);
                        }

                        const { data: user, error } = await query.maybeSingle();

                        if (!user || error) {
                            throw new Error("No verified user found");
                        }

                        if (!user.is_verified) {
                            throw new Error("Account is not yet verified");
                        }

                        return {
                            id: user.id,
                            _id: user.id,
                            username: user.username,
                            email: user.email,
                            avatar: user.avatar,
                            userType: user.user_type,
                            isVerified: user.is_verified
                        };
                    } catch (err: any) {
                        throw new Error(err.message || "Auto-login failed");
                    }
                }

                // Standard credentials flow
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email and password");
                }

                try {
                    const { data: user, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email)
                        .maybeSingle();

                    if (!user || error) {
                        throw new Error("No user found through this email");
                    }

                    if (!user.is_verified) {
                        throw new Error("Please verify your account first");
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password_hash);

                    if (isPasswordCorrect) {
                        return {
                            id: user.id,
                            _id: user.id,
                            username: user.username,
                            email: user.email,
                            avatar: user.avatar,
                            userType: user.user_type,
                            isVerified: user.is_verified
                        };
                    } else {
                        throw new Error("Incorrect Password");
                    }
                } catch (error: any) {
                    throw new Error(error.message || error);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user.id || (user as any)._id;
                token.isVerified = (user as any).isVerified;
                token.username = (user as any).username;
                token.email = user.email;
                token.avatar = (user as any).avatar;
                token.userType = (user as any).userType;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any)._id = token._id;
                (session.user as any).isVerified = token.isVerified;
                (session.user as any).username = token.username;
                session.user.email = token.email as string;
                (session.user as any).avatar = token.avatar;
                (session.user as any).userType = token.userType;
            }
            return session;
        }
    },
    pages: {
        signIn: "/sign-in",
        error: "/sign-in"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60 // 30 days session
    },
    secret: process.env.NEXTAUTH_SECRET || "easycode_nextauth_production_secret_key_2026"
};